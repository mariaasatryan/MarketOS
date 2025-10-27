-- Создание таблицы для хранения предпочтений пользователей по маркетплейсам
CREATE TABLE IF NOT EXISTS user_marketplace_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('wildberries', 'ozon', 'ym', 'smm')),
  is_selected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, marketplace)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_marketplace_preferences_user_id ON user_marketplace_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_marketplace_preferences_marketplace ON user_marketplace_preferences(marketplace);

-- Включение RLS (Row Level Security)
ALTER TABLE user_marketplace_preferences ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои предпочтения
CREATE POLICY "Users can view their own marketplace preferences" ON user_marketplace_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать свои предпочтения
CREATE POLICY "Users can create their own marketplace preferences" ON user_marketplace_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять свои предпочтения
CREATE POLICY "Users can update their own marketplace preferences" ON user_marketplace_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Политика: пользователи могут удалять свои предпочтения
CREATE POLICY "Users can delete their own marketplace preferences" ON user_marketplace_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_user_marketplace_preferences_updated_at
  BEFORE UPDATE ON user_marketplace_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
