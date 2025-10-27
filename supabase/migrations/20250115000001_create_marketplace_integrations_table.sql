-- Создание таблицы для хранения интеграций с маркетплейсами
CREATE TABLE IF NOT EXISTS marketplace_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('wildberries', 'ozon', 'ym')),
  api_token TEXT NOT NULL,
  client_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'error', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_user_id ON marketplace_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_marketplace ON marketplace_integrations(marketplace);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_active ON marketplace_integrations(is_active);

-- Включение RLS (Row Level Security)
ALTER TABLE marketplace_integrations ENABLE ROW LEVEL SECURITY;

-- Политика доступа: пользователи могут видеть только свои интеграции
CREATE POLICY "Users can view their own integrations" ON marketplace_integrations
  FOR SELECT USING (auth.uid() = user_id);

-- Политика доступа: пользователи могут создавать свои интеграции
CREATE POLICY "Users can create their own integrations" ON marketplace_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика доступа: пользователи могут обновлять свои интеграции
CREATE POLICY "Users can update their own integrations" ON marketplace_integrations
  FOR UPDATE USING (auth.uid() = user_id);

-- Политика доступа: пользователи могут удалять свои интеграции
CREATE POLICY "Users can delete their own integrations" ON marketplace_integrations
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
CREATE TRIGGER update_marketplace_integrations_updated_at
  BEFORE UPDATE ON marketplace_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
