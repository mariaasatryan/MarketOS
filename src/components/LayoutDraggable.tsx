import { ReactNode, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Megaphone,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  HardDrive,
  Sparkles,
  Settings,
  GripVertical
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isEditMode: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

const defaultMenuItems = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'products', icon: Package },
  { id: 'reviews', icon: MessageSquare },
  { id: 'advertising', icon: Megaphone },
  { id: 'analytics', icon: BarChart3 },
  { id: 'calendar', icon: Calendar },
  { id: 'sheets', icon: FileSpreadsheet },
  { id: 'disk', icon: HardDrive },
  { id: 'aiTools', icon: Sparkles },
  { id: 'settings', icon: Settings },
];

export function LayoutDraggable({ children, currentPage, onNavigate, isEditMode }: LayoutProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadNavigationOrder();
  }, [user, t]);

  const loadNavigationOrder = async () => {
    if (!user) {
      const items = defaultMenuItems.map(item => ({
        ...item,
        label: t(`nav.${item.id}`)
      }));
      setMenuItems(items);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('navigation_order')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.navigation_order && Array.isArray(data.navigation_order)) {
        const orderedItems = data.navigation_order
          .map((id: string) => defaultMenuItems.find(item => item.id === id))
          .filter(Boolean)
          .map(item => ({
            ...item,
            label: t(`nav.${item!.id}`)
          }));

        const missingItems = defaultMenuItems
          .filter(item => !data.navigation_order.includes(item.id))
          .map(item => ({
            ...item,
            label: t(`nav.${item.id}`)
          }));

        setMenuItems([...orderedItems, ...missingItems] as MenuItem[]);
      } else {
        const items = defaultMenuItems.map(item => ({
          ...item,
          label: t(`nav.${item.id}`)
        }));
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error loading navigation order:', error);
      const items = defaultMenuItems.map(item => ({
        ...item,
        label: t(`nav.${item.id}`)
      }));
      setMenuItems(items);
    }
  };

  const saveNavigationOrder = async (order: string[]) => {
    if (!user) {
      localStorage.setItem('navigationOrder', JSON.stringify(order));
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          navigation_order: order,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving navigation order:', error);
      localStorage.setItem('navigationOrder', JSON.stringify(order));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMenuItems(items);
    saveNavigationOrder(items.map(item => item.id));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('app.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('app.subtitle')}</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <Droppable droppableId="navigation" isDropDisabled={!isEditMode}>
            {(provided, snapshot) => (
              <nav
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex-1 p-4 space-y-1 overflow-y-auto ${
                  snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                      isDragDisabled={!isEditMode}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative ${snapshot.isDragging ? 'z-50' : ''}`}
                        >
                          <button
                            onClick={() => !isDragging && !isEditMode && onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            } ${
                              snapshot.isDragging
                                ? 'shadow-lg ring-2 ring-blue-500 dark:ring-blue-400'
                                : ''
                            } ${
                              isEditMode ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            {isEditMode && (
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                              >
                                <GripVertical size={16} className="text-slate-400" />
                              </div>
                            )}
                            <Icon size={20} />
                            <span>{item.label}</span>
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </nav>
            )}
          </Droppable>
        </DragDropContext>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
