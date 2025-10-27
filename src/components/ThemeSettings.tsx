import { useI18n } from '../contexts/I18nContext';
import { Moon, Sun, Monitor, Palette, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSettingsProps {
  className?: string;
}

export function ThemeSettings({ className = '' }: ThemeSettingsProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      name: t('theme.light'),
      description: t('theme.lightDescription'),
      icon: Sun,
      preview: 'bg-white border-slate-200'
    },
    {
      id: 'dark',
      name: t('theme.dark'),
      description: t('theme.darkDescription'),
      icon: Moon,
      preview: 'bg-slate-800 border-slate-700'
    },
    {
      id: 'auto',
      name: t('theme.auto'),
      description: t('theme.autoDescription'),
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-slate-800 border-slate-400'
    }
  ];

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === 'auto') {
      // Auto theme - follow system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // Store auto preference
      localStorage.setItem('theme-preference', 'auto');
    } else {
      setTheme(newTheme as 'light' | 'dark');
      localStorage.setItem('theme-preference', newTheme);
    }
  };

  const getCurrentThemePreference = () => {
    const preference = localStorage.getItem('theme-preference');
    return preference || 'light';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
          {t('theme.title')}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('theme.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.id === 'auto' ? getCurrentThemePreference() === 'auto' : theme === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  <Icon size={20} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'} />
                </div>
                <div>
                  <h4 className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-white'}`}>
                    {option.name}
                  </h4>
                  <p className={`text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
              
              {/* Theme Preview */}
              <div className={`w-full h-16 rounded-lg border ${option.preview} flex items-center justify-center`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <div className="w-8 h-2 rounded bg-slate-300"></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Theme Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-800 dark:text-white">{t('theme.additionalSettings')}</h4>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('theme.smoothTransitions')}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {t('theme.smoothTransitionsDescription')}
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('theme.highContrast')}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {t('theme.highContrastDescription')}
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('theme.saveChoice')}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {t('theme.saveChoiceDescription')}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Theme Preview */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-800 dark:text-white">{t('theme.preview')}</h4>
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="w-16 h-8 bg-blue-600 rounded"></div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Theme toggle button component for quick access
interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors ${className}`}
      title={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      {showLabel && (
        <span className="text-sm font-medium">
          {theme === 'light' ? t('theme.dark') : t('theme.light')}
        </span>
      )}
    </button>
  );
}
