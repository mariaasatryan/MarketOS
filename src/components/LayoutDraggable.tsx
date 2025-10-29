import { ReactNode, useState, useEffect, useCallback } from 'react';
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
  Zap,
  DollarSign,
  Settings,
  GripVertical,
  Sparkles,
  Bell,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';
import { notificationService } from '../services/notificationService';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isEditMode: boolean;
  onShowNotifications?: (show: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  isSpecial?: boolean;
}

const defaultMenuItems = [
  { id: 'marketai', icon: Sparkles, isSpecial: true },
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'products', icon: Package },
  { id: 'reviews', icon: MessageSquare },
  { id: 'advertising', icon: Megaphone },
  { id: 'analytics', icon: BarChart3 },
  { id: 'financial', icon: DollarSign },
  { id: 'enhanced-inventory', icon: Package },
  { id: 'automation', icon: Zap },
  { id: 'calendar', icon: Calendar },
  { id: 'sheets', icon: FileSpreadsheet },
  { id: 'disk', icon: HardDrive },
  { id: 'settings', icon: Settings },
];

export function LayoutDraggable({ children, currentPage, onNavigate, isEditMode, onShowNotifications }: LayoutProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Debug: Log navigation changes
  useEffect(() => {
    console.log('🧭 LayoutDraggable: Navigation changed to:', currentPage);
  }, [currentPage]);

  const loadNavigationOrder = useCallback(async () => {
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
  }, [user, t]);

  useEffect(() => {
    loadNavigationOrder();
  }, [user, t, loadNavigationOrder]);

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifications) => {
      const unreadCount = notifications.filter(n => !n.read).length;
      setUnreadNotifications(unreadCount);
    });

    // Load initial notification count
    const notifications = notificationService.getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnreadNotifications(unreadCount);

    return unsubscribe;
  }, []);

  const saveNavigationOrder = async (order: string[]) => {
    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('navigationOrder', JSON.stringify(order));
      }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('navigationOrder', JSON.stringify(order));
      }
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
          <div className="flex items-center justify-between">
            <Logo className="flex-1" />
            <div className="flex items-center justify-center">
              <button
                onClick={() => onShowNotifications?.(true)}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
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
                  const isSpecial = item.isSpecial;

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
                          {/* Разделитель перед обычными функциями */}
                          {index === 1 && (
                            <div className="my-3 border-t border-slate-200 dark:border-slate-600"></div>
                          )}
                          
                          <button
                            onClick={() => !isDragging && !isEditMode && onNavigate(item.id)}
                            className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                              isSpecial
                                ? isActive
                                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-blue-500/25 animate-pulse'
                                  : 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 text-blue-700 dark:text-blue-300 font-semibold hover:from-blue-100 hover:via-purple-100 hover:to-pink-100 dark:hover:from-blue-800/30 dark:hover:via-purple-800/30 dark:hover:to-pink-800/30 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000'
                                : isActive
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            } ${
                              snapshot.isDragging
                                ? 'shadow-lg ring-2 ring-blue-500 dark:ring-blue-400'
                                : ''
                            } ${
                              isEditMode ? 'cursor-default' : 'cursor-pointer'
                            } ${
                              isSpecial ? 'border border-blue-200 dark:border-blue-700' : ''
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
                            <Icon size={20} className={`flex-shrink-0 ${isSpecial ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                            <span className={`text-left ${isSpecial ? 'text-blue-800 dark:text-blue-200' : ''}`}>{item.label}</span>
                            {isSpecial && (
                              <div className="ml-auto relative">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
                              </div>
                            )}
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
