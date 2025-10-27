import { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { Login } from './components/Login';
import { LayoutDraggable } from './components/LayoutDraggable';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NotificationCenter } from './components/NotificationCenter';
import Dashboard from './pages/Dashboard';
import { Products } from './pages/Products';
import { Reviews } from './pages/Reviews';
import { Advertising } from './pages/Advertising';
import { Analytics } from './pages/Analytics';
import { DailyReports } from './pages/DailyReports';
import PlanFactAnalysis from './pages/PlanFactAnalysis';
import ProductAudit from './pages/ProductAudit';
import ProfitAnalysis from './pages/ProfitAnalysis';
import FinancialModule from './pages/FinancialModule';
import EnhancedInventoryManagement from './pages/EnhancedInventoryManagement';
import { InventoryManagement } from './pages/InventoryManagement';
import { Calendar } from './pages/Calendar';
import { Sheets } from './pages/Sheets';
import { Disk } from './pages/Disk';
import MarketAI from './pages/MarketAI';
import { Settings } from './pages/Settings';
import { APITest } from './pages/APITest';
import { TestButtons } from './pages/TestButtons';
import Automation from './pages/Automation';
import { pwaService } from './services/pwaService';
import { notificationService } from './services/notificationService';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('🔍 App: User state changed:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      loading 
    });
  }, [user, loading]);

  // Initialize PWA and notification services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await pwaService.initialize();
        await notificationService.initialize();
        
        // Show welcome notification
        notificationService.addNotification({
          type: 'info',
          title: 'Добро пожаловать в MarketOS!',
          message: 'Система уведомлений активирована. Вы будете получать важные обновления.',
          priority: 'low',
          category: 'system'
        });
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'reviews':
        return <Reviews />;
      case 'advertising':
        return <Advertising />;
      case 'analytics':
      case 'advanced-analytics':
        return <Analytics />;
      case 'daily-reports':
        return <DailyReports />;
      case 'plan-fact':
        return <PlanFactAnalysis />;
      case 'product-audit':
        return <ProductAudit />;
      case 'profit-analysis':
        return <ProfitAnalysis />;
      case 'inventory':
        return <InventoryManagement />;
      case 'calendar':
        return <Calendar />;
      case 'sheets':
        return <Sheets />;
      case 'disk':
        return <Disk />;
      case 'marketai':
        return <MarketAI />;
      case 'enhanced-marketai':
        return <MarketAI />;
      case 'enhanced-inventory':
        return <EnhancedInventoryManagement />;
      case 'automation':
        return <Automation />;
      case 'financial':
        return <FinancialModule />;
      case 'settings':
        return <Settings isEditMode={isEditMode} setIsEditMode={setIsEditMode} />;
      case 'apitest':
        return <APITest />;
      case 'test-buttons':
        return <TestButtons />;
      default:
        return <Dashboard />;
    }
  }, [currentPage, isEditMode]);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка..." />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }


  return (
    <>
      <LayoutDraggable 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        isEditMode={isEditMode}
        onShowNotifications={setShowNotifications}
      >
        {renderPage()}
      </LayoutDraggable>
      
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <AppConfigProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </AppConfigProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
