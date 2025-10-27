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
  Sparkles,
  HardDrive,
  FileText,
  Warehouse,
  TestTube,
  Target,
  Search,
  TrendingUp,
  DollarSign,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

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
    { id: 'daily-reports', label: 'Ежедневные отчеты', icon: FileText },
    { id: 'plan-fact', label: 'План-факт анализ', icon: Target },
    { id: 'product-audit', label: 'Аудит карточек', icon: Search },
    { id: 'profit-analysis', label: 'Анализ прибыли', icon: TrendingUp },
    { id: 'financial', label: 'Финансовый модуль', icon: DollarSign },
    { id: 'enhanced-inventory', label: 'Умные остатки', icon: Zap },
    { id: 'inventory', label: 'Остатки', icon: Warehouse },
    { id: 'calendar', label: 'Календарь', icon: Calendar },
    { id: 'sheets', label: 'Таблицы', icon: FileSpreadsheet },
    { id: 'settings', label: 'Настройки', icon: Settings },
    { id: 'disk', label: 'Диск', icon: HardDrive },
    { id: 'ai', label: 'ИИ-Инструменты', icon: Sparkles },
    { id: 'api-test', label: 'Тест API', icon: TestTube },
  ];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { signOut } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <Logo className="justify-center" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-50 text-red-700 font-medium border-l-4 border-red-600'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
