import { createContext, useContext, useState, ReactNode } from 'react';
import type { AppMode } from '../types';
import { config } from '../config';

interface AppConfigContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppModeState] = useState<AppMode>(config.app.mode);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appMode', mode);
    }
  };

  return (
    <AppConfigContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
}
