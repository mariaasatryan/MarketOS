import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { Login } from './components/Login';
import { LayoutDraggable } from './components/LayoutDraggable';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import { Products } from './pages/Products';
import { Reviews } from './pages/Reviews';
import { Advertising } from './pages/Advertising';
import { Analytics } from './pages/Analytics';
import { Calendar } from './pages/Calendar';
import { Sheets } from './pages/Sheets';
import { Disk } from './pages/Disk';
import { AITools } from './pages/AITools';
import { Settings } from './pages/Settings';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isEditMode, setIsEditMode] = useState(false);

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
        return <Analytics />;
      case 'calendar':
        return <Calendar />;
      case 'sheets':
        return <Sheets />;
      case 'disk':
        return <Disk />;
      case 'aiTools':
        return <AITools />;
      case 'settings':
        return <Settings isEditMode={isEditMode} setIsEditMode={setIsEditMode} />;
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
    <LayoutDraggable 
      currentPage={currentPage} 
      onNavigate={handleNavigate} 
      isEditMode={isEditMode}
    >
      {renderPage()}
    </LayoutDraggable>
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
