// src/components/Login.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { Logo } from './Logo';
import { MarketplaceSelector } from './MarketplaceSelector';
import { Marketplace } from '../types';
import { Globe } from 'lucide-react';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Marketplace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { language, setLanguage, t } = useI18n();

  // Отладочная информация
  console.log('Current language:', language);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
      } else {
        // Валидация полей для регистрации
        if (!fullName.trim()) {
          throw new Error(t('auth.enterName'));
        }
        if (!phone.trim()) {
          throw new Error(t('auth.enterPhone'));
        }
        if (!email.trim()) {
          throw new Error(t('auth.enterEmail'));
        }
        if (!password.trim()) {
          throw new Error(t('auth.enterPassword'));
        }
        if (password.length < 6) {
          throw new Error(t('auth.passwordMinLength'));
        }
        if (password !== confirmPassword) {
          throw new Error(t('auth.passwordsDoNotMatch'));
        }
        if (selectedMarketplaces.length === 0) {
          throw new Error(t('auth.selectMarketplace'));
        }
        
        // При регистрации сохраняем выбранные маркетплейсы
        const { error } = await signUp(email.trim(), password, fullName.trim(), selectedMarketplaces);
        if (error) throw error;
        
        // Показываем сообщение об успешной регистрации
        setSuccess(t('auth.registrationSuccess'));
      }
    } catch (e: any) {
      console.error('Ошибка авторизации:', e);
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      // Успешная авторизация через Google
      console.log('✅ Google OAuth successful');
      
      // Показываем сообщение об успехе
      if (isLogin) {
        setSuccess(t('auth.loginSuccess'));
      } else {
        setSuccess(t('auth.registrationSuccess'));
      }
    } catch (e: any) {
      console.error('Google sign-in error:', e);
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div key={language} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 grid place-items-center p-6 relative">
      {/* Language Switcher - Bottom Left */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2">
        <Globe size={20} className="text-slate-600" />
        <button
          onClick={() => {
            console.log('Switching to Russian');
            setLanguage('ru');
          }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            language === 'ru'
              ? 'bg-red-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
          }`}
        >
          RU
        </button>
        <button
          onClick={() => {
            console.log('Switching to English');
            setLanguage('en');
          }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            language === 'en'
              ? 'bg-red-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
          }`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo at top */}
        <div className="text-center mb-8">
          <Logo className="justify-center" />
        </div>
        
        <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">{isLogin ? t('auth.login') : t('auth.register')}</h1>
            <p className="text-slate-600 mt-2">{t('auth.subtitle')}</p>
          </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.fullName')}</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.fullNamePlaceholder')}
            />
          </div>
        )}

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.phone')}</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('auth.phonePlaceholder')}
            />
          </div>
        )}

        {!isLogin && (
          <div className="pt-4 border-t border-slate-200">
            <MarketplaceSelector
              key={language}
              selectedMarketplaces={selectedMarketplaces}
              onSelectionChange={setSelectedMarketplaces}
              title={t('auth.selectMarketplaces')}
              description={t('auth.selectMarketplacesDescription')}
              className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.email')}</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.password')}</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('auth.confirmPassword')}</label>
            <input
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-300'
              }`}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{t('auth.passwordsDoNotMatch')}</p>
            )}
          </div>
        )}

        {error && <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
        {success && <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">{success}</div>}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-slate-300 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? t('auth.connecting') : isLogin ? t('auth.signInWithGoogle') : t('auth.signUpWithGoogle')}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-slate-500">{t('auth.or')}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? t('auth.submitting') : isLogin ? t('auth.signIn') : t('auth.signUp')}
        </button>

        <div className="text-center">
          <button
            type="button"
            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            onClick={() => setIsLogin((v) => !v)}
          >
            {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}