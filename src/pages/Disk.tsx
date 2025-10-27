import { useState, useEffect, useCallback } from 'react';
import { Plus, ExternalLink, Search, Trash2, Edit2, FolderOpen } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { validateUrl, sanitizeInput, normalizeUrl } from '../utils/validation';

interface DiskLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  created_at: string;
  folder_id?: string;
}

interface Folder {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export function Disk() {
  useI18n();
  const { user } = useAuth();
  const [links, setLinks] = useState<DiskLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '', folder_id: '' });

  // Отладка состояния newLink
  useEffect(() => {
    console.log('newLink state changed:', newLink);
  }, [newLink]);
  const [editingLink, setEditingLink] = useState<DiskLink | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Проверяем, работает ли Supabase
  const isSupabaseWorking = () => {
    try {
      return !!(supabase && typeof supabase.from === 'function' && user);
    } catch (error) {
      console.warn('Supabase not available, using local storage');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      if (isSupabaseWorking()) {
        // Пытаемся загрузить из Supabase
        try {
          const { data: filesData, error: filesError } = await supabase
        .from('google_drive_files')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

          if (filesError) {
            console.warn('Supabase files error, using local storage:', filesError);
            loadFromLocalStorage();
          } else {
            setLinks(filesData || []);
          }

          // Загружаем папки
          const { data: foldersData, error: foldersError } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false });

          if (foldersError) {
            console.warn('Supabase folders error, using local storage:', foldersError);
            loadFoldersFromLocalStorage();
          } else {
            setFolders(foldersData || []);
          }
        } catch (error) {
          console.warn('Supabase connection failed, using local storage:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading files:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedLinks = localStorage.getItem(`disk_links_${user?.id}`);
      if (savedLinks) {
        setLinks(JSON.parse(savedLinks));
      }
      
      const savedFolders = localStorage.getItem(`disk_folders_${user?.id}`);
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setLinks([]);
      setFolders([]);
    }
  };

  const loadFoldersFromLocalStorage = () => {
    try {
      const savedFolders = localStorage.getItem(`disk_folders_${user?.id}`);
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      }
    } catch (error) {
      console.error('Error loading folders from localStorage:', error);
      setFolders([]);
    }
  };

  const saveToLocalStorage = (linksData: DiskLink[], foldersData: Folder[]) => {
    try {
      localStorage.setItem(`disk_links_${user?.id}`, JSON.stringify(linksData));
      localStorage.setItem(`disk_folders_${user?.id}`, JSON.stringify(foldersData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'Все', icon: FolderOpen },
    { id: 'фотосъемки', name: 'Фотосъемки', icon: FolderOpen },
    { id: 'инфографика', name: 'Инфографика', icon: FolderOpen },
    { id: 'документы', name: 'Документы', icon: FolderOpen },
    { id: 'договоры', name: 'Договоры', icon: FolderOpen },
    { id: 'no-folder', name: 'Без папки', icon: FolderOpen },
  ];

  const filteredLinks = links.filter(link => {
    let matchesCategory = true;
    
    if (selectedCategory === 'no-folder') {
      matchesCategory = !link.folder_id;
    } else if (selectedCategory !== 'all') {
      matchesCategory = link.folder_id === selectedCategory;
    }
    
    const matchesSearch = link.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Создаем список всех категорий включая пользовательские папки
  const allCategories = [
    ...categories,
    ...folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      icon: FolderOpen
    }))
  ];

  const handleAddLink = useCallback(async () => {
    console.log('handleAddLink called', { newLink, user: !!user });
    
    if (!newLink.name || !newLink.url || !user) {
      console.log('Validation failed:', { hasName: !!newLink.name, hasUrl: !!newLink.url, hasUser: !!user });
      return;
    }

    // Validate inputs
    if (!validateUrl(newLink.url)) {
      alert('Пожалуйста, введите корректный URL (например: google.com или https://example.com)');
      return;
    }

    // Нормализуем URL (добавляем протокол если нужно)
    const normalizedUrl = normalizeUrl(newLink.url);

    const sanitizedLink = {
      name: sanitizeInput(newLink.name),
      url: normalizedUrl,
      description: newLink.description ? sanitizeInput(newLink.description) : '',
      folder_id: newLink.folder_id,
    };

    console.log('Sanitized link:', sanitizedLink);

    const newFile: DiskLink = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizedLink.name,
      url: sanitizedLink.url,
      description: sanitizedLink.description,
      folder_id: sanitizedLink.folder_id || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseWorking()) {
        // Пытаемся сохранить в Supabase
    try {
      const { data, error } = await supabase
        .from('google_drive_files')
        .insert([{
          user_id: user.id,
              name: sanitizedLink.name,
              url: sanitizedLink.url,
              description: sanitizedLink.description || null,
              folder_id: sanitizedLink.folder_id || null,
        }])
        .select()
        .single();

          if (error) {
            console.warn('Supabase insert failed, using local storage:', error);
            throw error;
          }
          
          console.log('File added to Supabase successfully:', data);
          const updatedLinks = [data, ...links];
          setLinks(updatedLinks);
          saveToLocalStorage(updatedLinks, folders);
        } catch (error) {
          console.warn('Supabase error, saving locally:', error);
          const updatedLinks = [newFile, ...links];
          setLinks(updatedLinks);
          saveToLocalStorage(updatedLinks, folders);
        }
      } else {
        // Сохраняем локально
        const updatedLinks = [newFile, ...links];
        setLinks(updatedLinks);
        saveToLocalStorage(updatedLinks, folders);
        console.log('File added locally:', newFile);
      }
      
      setNewLink({ name: '', url: '', description: '', folder_id: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding file:', error);
      alert('Ошибка при добавлении файла');
    }
  }, [newLink, user, links, folders]);

  const handleDeleteLink = async (id: string) => {
    console.log('handleDeleteLink called', { id });
    
    if (!confirm('Вы уверены, что хотите удалить этот файл?')) return;
    
    try {
      if (isSupabaseWorking()) {
        // Пытаемся удалить из Supabase
    try {
      const { error } = await supabase
        .from('google_drive_files')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

          if (error) {
            console.warn('Supabase delete failed, using local storage:', error);
            throw error;
          }
        } catch (error) {
          console.warn('Supabase error, deleting locally:', error);
        }
      }
      
      // Удаляем локально
      const updatedLinks = links.filter(link => link.id !== id);
      setLinks(updatedLinks);
      saveToLocalStorage(updatedLinks, folders);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Ошибка при удалении файла');
    }
  };

  const handleUpdateLink = async () => {
    console.log('handleUpdateLink called', { editingLink });
    
    if (!editingLink || !user) return;

    // Validate URL
    if (!validateUrl(editingLink.url)) {
      alert('Пожалуйста, введите корректный URL (например: google.com или https://example.com)');
      return;
    }

    // Нормализуем URL
    const normalizedUrl = normalizeUrl(editingLink.url);
    const updatedLink = { ...editingLink, url: normalizedUrl };

    try {
      if (isSupabaseWorking()) {
        // Пытаемся обновить в Supabase
        try {
          const { error } = await supabase
            .from('google_drive_files')
            .update({
              name: updatedLink.name,
              url: updatedLink.url,
              description: updatedLink.description || null,
              folder_id: updatedLink.folder_id || null,
            })
            .eq('id', updatedLink.id)
            .eq('user_id', user.id);

          if (error) {
            console.warn('Supabase update failed, using local storage:', error);
            throw error;
          }
        } catch (error) {
          console.warn('Supabase error, updating locally:', error);
        }
      }
      
      // Обновляем локально
      const updatedLinks = links.map(link => link.id === updatedLink.id ? updatedLink : link);
      setLinks(updatedLinks);
      saveToLocalStorage(updatedLinks, folders);
      setShowEditModal(false);
      setEditingLink(null);
      console.log('File updated successfully');
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Ошибка при обновлении файла');
    }
  };

  const handleAddFolder = async () => {
    console.log('handleAddFolder called', { newFolderName, user: !!user });
    
    if (!newFolderName.trim() || !user) {
      console.log('Validation failed:', { hasName: !!newFolderName.trim(), hasUser: !!user });
      return;
    }

    const newFolder: Folder = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizeInput(newFolderName.trim()),
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseWorking()) {
        // Пытаемся сохранить в Supabase
        try {
          const { data, error } = await supabase
            .from('folders')
            .insert([{
              user_id: user.id,
              name: sanitizeInput(newFolderName.trim()),
            }])
            .select()
            .single();

          if (error) {
            console.warn('Supabase insert failed, using local storage:', error);
            throw error;
          }
          
          console.log('Folder added to Supabase successfully:', data);
          const updatedFolders = [data, ...folders];
          setFolders(updatedFolders);
          saveToLocalStorage(links, updatedFolders);
        } catch (error) {
          console.warn('Supabase error, saving locally:', error);
          const updatedFolders = [newFolder, ...folders];
          setFolders(updatedFolders);
          saveToLocalStorage(links, updatedFolders);
        }
      } else {
        // Сохраняем локально
        const updatedFolders = [newFolder, ...folders];
        setFolders(updatedFolders);
        saveToLocalStorage(links, updatedFolders);
        console.log('Folder added locally:', newFolder);
      }
      
      setNewFolderName('');
      setShowAddFolderModal(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Ошибка при создании папки');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    console.log('handleDeleteFolder called', { folderId });
    
    if (!user) return;

    // Проверяем, есть ли файлы в папке
    const filesInFolder = links.filter(link => link.folder_id === folderId);
    if (filesInFolder.length > 0) {
      alert('Нельзя удалить папку, в которой есть файлы. Сначала переместите или удалите все файлы из папки.');
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить эту папку?')) return;

    try {
      if (isSupabaseWorking()) {
        // Пытаемся удалить из Supabase
        try {
          const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', folderId)
            .eq('user_id', user.id);

          if (error) {
            console.warn('Supabase delete failed, using local storage:', error);
            throw error;
          }
        } catch (error) {
          console.warn('Supabase error, deleting locally:', error);
        }
      }
      
      // Удаляем локально
      const updatedFolders = folders.filter(folder => folder.id !== folderId);
      setFolders(updatedFolders);
      saveToLocalStorage(links, updatedFolders);
      console.log('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Ошибка при удалении папки');
    }
  };

  const handleOpenLink = (url: string) => {
    console.log('handleOpenLink called', { url });
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Диск</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Управление файлами и ссылками</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('Create folder button clicked');
              setShowAddFolderModal(true);
            }}
            className="bg-white text-black border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
          >
            <FolderOpen size={20} />
            Создать папку
          </button>
        <button
            onClick={() => {
              console.log('Add file button clicked');
              setShowAddModal(true);
            }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Добавить файл
        </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Поиск файлов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {allCategories.map(category => (
          <button
            key={category.id}
            onClick={() => {
              console.log('Category clicked:', category.id);
              setSelectedCategory(category.id);
            }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <category.icon size={16} />
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Показываем пользовательские папки */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Ваши папки</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map(folder => {
                  const folderFiles = links.filter(link => link.folder_id === folder.id);
                  return (
                    <div key={folder.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                            <FolderOpen className="text-yellow-600 dark:text-yellow-400" size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">{folder.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {folderFiles.length} файлов
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            console.log('Delete folder button clicked:', folder.id);
                            handleDeleteFolder(folder.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Удалить папку"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          console.log('View folder files clicked:', folder.id);
                          setSelectedCategory(folder.id);
                        }}
                        className="w-full text-left text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Просмотреть файлы →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Показываем файлы */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              {selectedCategory === 'all' ? 'Все файлы' : 
               selectedCategory === 'no-folder' ? 'Файлы без папки' :
               allCategories.find(c => c.id === selectedCategory)?.name || 'Файлы'}
            </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map(link => (
            <div
              key={link.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">{link.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                        {link.folder_id ? allCategories.find(c => c.id === link.folder_id)?.name || 'Папка' : 'Без папки'}
                  </p>
                  {link.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{link.description}</p>
                  )}
                </div>
                <FolderOpen className="text-red-600 dark:text-red-400" size={24} />
              </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        console.log('Edit file button clicked:', link.id);
                        setEditingLink(link);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                <Edit2 size={16} />
              </button>
              <button
                      onClick={() => {
                        console.log('Delete file button clicked:', link.id);
                        handleDeleteLink(link.id);
                      }}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
                  <button
                    onClick={() => {
                      console.log('Open link button clicked:', link.url);
                      handleOpenLink(link.url);
                    }}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Открыть
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredLinks.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={64} />
          <p className="text-slate-600 dark:text-slate-400">Ничего не найдено</p>
        </div>
      )}

      {/* Модальное окно добавления файла */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Добавить файл</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => {
                    console.log('Name input changed:', e.target.value);
                    setNewLink({ ...newLink, name: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  placeholder="google.com или https://example.com"
                  value={newLink.url}
                  onChange={(e) => {
                    console.log('URL input changed:', e.target.value);
                    console.log('Previous value:', newLink.url);
                    setNewLink({ ...newLink, url: e.target.value });
                  }}
                  onPaste={(e) => {
                    console.log('URL paste event:', e.clipboardData.getData('text'));
                  }}
                  onKeyDown={(e) => {
                    console.log('URL key down:', e.key, (e.target as HTMLInputElement).value);
                  }}
                  onInput={(e) => {
                    console.log('URL input event:', e.currentTarget.value);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Можно вводить с https:// или без него
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Папка
                </label>
                <select
                  value={newLink.folder_id}
                  onChange={(e) => {
                    console.log('Folder select changed:', e.target.value);
                    setNewLink({ ...newLink, folder_id: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Без папки</option>
                  {categories.slice(1, -1).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Описание (опционально)
                </label>
                <textarea
                  value={newLink.description}
                  onChange={(e) => {
                    console.log('Description input changed:', e.target.value);
                    setNewLink({ ...newLink, description: e.target.value });
                  }}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    console.log('Add file button clicked in modal');
                    handleAddLink();
                  }}
                  disabled={!newLink.name || !newLink.url}
                  className="flex-1 tech-button px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Добавить
                </button>
                <button
                  onClick={() => {
                    console.log('Cancel add file button clicked');
                    setShowAddModal(false);
                  }}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования файла */}
      {showEditModal && editingLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Редактировать файл</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={editingLink.name}
                  onChange={(e) => {
                    console.log('Edit name input changed:', e.target.value);
                    setEditingLink({...editingLink, name: e.target.value});
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  placeholder="google.com или https://example.com"
                  value={editingLink.url}
                  onChange={(e) => {
                    console.log('Edit URL input changed:', e.target.value);
                    console.log('Previous edit value:', editingLink.url);
                    setEditingLink({...editingLink, url: e.target.value});
                  }}
                  onPaste={(e) => {
                    console.log('Edit URL paste event:', e.clipboardData.getData('text'));
                  }}
                  onKeyDown={(e) => {
                    console.log('Edit URL key down:', e.key, (e.target as HTMLInputElement).value);
                  }}
                  onInput={(e) => {
                    console.log('Edit URL input event:', e.currentTarget.value);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Можно вводить с https:// или без него
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Папка
                </label>
                <select
                  value={editingLink.folder_id || ''}
                  onChange={(e) => {
                    console.log('Edit folder select changed:', e.target.value);
                    setEditingLink({...editingLink, folder_id: e.target.value});
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Без папки</option>
                  {categories.slice(1, -1).map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Описание (опционально)
                </label>
                <textarea
                  value={editingLink.description || ''}
                  onChange={(e) => {
                    console.log('Edit description input changed:', e.target.value);
                    setEditingLink({...editingLink, description: e.target.value});
                  }}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    console.log('Save edit button clicked');
                    handleUpdateLink();
                  }}
                  disabled={!editingLink.name || !editingLink.url}
                  className="flex-1 tech-button px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    console.log('Cancel edit button clicked');
                    setShowEditModal(false);
                    setEditingLink(null);
                  }}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания папки */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Создать папку</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Название папки
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => {
                    console.log('Folder name input changed:', e.target.value);
                    setNewFolderName(e.target.value);
                  }}
                  placeholder="Введите название папки"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    console.log('Create folder button clicked in modal');
                    handleAddFolder();
                  }}
                  disabled={!newFolderName.trim()}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Создать
                </button>
                <button
                  onClick={() => {
                    console.log('Cancel create folder button clicked');
                    setShowAddFolderModal(false);
                    setNewFolderName('');
                  }}
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