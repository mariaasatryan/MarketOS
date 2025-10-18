import React from 'react';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Megaphone,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Обзорная панель', icon: LayoutDashboard },
  { id: 'products', label: 'Товары', icon: Package },
  { id: 'reviews', label: 'Отзывы', icon: MessageSquare },
  { id: 'advertising', label: 'Реклама', icon: Megaphone },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { id: 'calendar', label: 'Календарь', icon: Calendar },
  { id: 'sheets', label: 'Таблицы', icon: FileSpreadsheet },
  { id: 'settings', label: 'Настройки', icon: Settings },
  { id: 'disk', label: 'Диск', icon: Settings }, // при желании поменяй иконку на Folder
  { id: 'ai', label: 'ИИ-Инструменты', icon: Sparkles },
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { signOut } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Виртуальный менеджер</h1>
          <p className="text-xs text-slate-500 mt-1">Управление маркетплейсами</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
