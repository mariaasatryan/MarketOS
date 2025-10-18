# Настройка Supabase

## Информация о подключении

### Клиентское приложение (React)
- **URL**: `https://ypmrhqltmkuorwcynyrv.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbXJocWx0bWt1b3J3Y3lueXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzQ4MDAsImV4cCI6MjA1MjU1MDgwMH0.placeholder_key`

### База данных (PostgreSQL)
- **Host**: `db.ypmrhqltmkuorwcynyrv.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `maryJan12!marketOS`

## Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ypmrhqltmkuorwcynyrv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbXJocWx0bWt1b3J3Y3lueXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzQ4MDAsImV4cCI6MjA1MjU1MDgwMH0.placeholder_key

# Database Connection (for server-side use only)
DATABASE_URL=postgresql://postgres:maryJan12!marketOS@db.ypmrhqltmkuorwcynyrv.supabase.co:5432/postgres

# App Configuration
VITE_APP_MODE=LIVE
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000
VITE_API_TIMEOUT=30000
VITE_CACHE_TTL=300000
```

## Важно!

⚠️ **Замените `placeholder_key` на ваш настоящий анонимный ключ из панели Supabase!**

1. Зайдите в панель Supabase: https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в Settings → API
4. Скопируйте "anon public" ключ
5. Замените `placeholder_key` на настоящий ключ

## Использование

```typescript
import { supabase } from '../lib/supabase';

// Получение данных
const { data, error } = await supabase
  .from('profiles')
  .select('*');

// Вставка данных
const { data, error } = await supabase
  .from('profiles')
  .insert([{ email: 'user@example.com' }]);
```
