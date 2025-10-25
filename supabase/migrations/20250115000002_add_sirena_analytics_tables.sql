-- Миграция для добавления таблиц аналитики Sirena.ai
-- Создание таблиц для интеграций с маркетплейсами
CREATE TABLE IF NOT EXISTS "MarketplaceIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MarketplaceIntegration_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы продуктов
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "dimensions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы продаж
CREATE TABLE IF NOT EXISTS "Sale" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "qty" INTEGER NOT NULL,
    "revenue" DECIMAL(10,2) NOT NULL,
    "refundQty" INTEGER NOT NULL DEFAULT 0,
    "refundAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы комиссий и штрафов
CREATE TABLE IF NOT EXISTS "Fee" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "FeeType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы рекламной статистики
CREATE TABLE IF NOT EXISTS "AdsStats" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "platform" TEXT NOT NULL,
    "campaign" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdsStats_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы SEO снимков
CREATE TABLE IF NOT EXISTS "SeoSnapshot" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "position" INTEGER,
    "query" TEXT NOT NULL,
    "conversion" DECIMAL(5,4),
    "ctr" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeoSnapshot_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS "Alert" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "productId" TEXT,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы Telegram пользователей
CREATE TABLE IF NOT EXISTS "TelegramUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы правил уведомлений
CREATE TABLE IF NOT EXISTS "NotificationRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "conditions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationRule_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы ежедневных KPI
CREATE TABLE IF NOT EXISTS "DailyKPI" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "profit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "adsSpend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyKPI_pkey" PRIMARY KEY ("id")
);

-- Создание таблицы аналитики продуктов
CREATE TABLE IF NOT EXISTS "ProductAnalytics" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "daysOfCover" INTEGER,
    "sellThrough" DECIMAL(5,4),
    "isDeadStock" BOOLEAN NOT NULL DEFAULT false,
    "roas" DECIMAL(5,4),
    "cpa" DECIMAL(10,2),
    "margin" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductAnalytics_pkey" PRIMARY KEY ("id")
);

-- Добавление новых enum типов
DO $$ BEGIN
    CREATE TYPE "FeeType" AS ENUM ('COMMISSION', 'STORAGE', 'PENALTY', 'LOGISTICS', 'ADVERTISING', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AlertType" AS ENUM ('DEAD_STOCK', 'LOW_ROAS', 'HIGH_STORAGE_COST', 'SUPPLY_DEADLINE', 'STOCK_OUT', 'HIGH_REFUND_RATE', 'CAMPAIGN_CONFLICT', 'SEO_DROP', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS "MarketplaceIntegration_userId_idx" ON "MarketplaceIntegration"("userId");
CREATE INDEX IF NOT EXISTS "Product_integrationId_idx" ON "Product"("integrationId");
CREATE INDEX IF NOT EXISTS "Product_sku_idx" ON "Product"("sku");
CREATE INDEX IF NOT EXISTS "Sale_integrationId_date_idx" ON "Sale"("integrationId", "date");
CREATE INDEX IF NOT EXISTS "Sale_productId_date_idx" ON "Sale"("productId", "date");
CREATE INDEX IF NOT EXISTS "Fee_integrationId_date_idx" ON "Fee"("integrationId", "date");
CREATE INDEX IF NOT EXISTS "Fee_productId_date_idx" ON "Fee"("productId", "date");
CREATE INDEX IF NOT EXISTS "AdsStats_integrationId_date_idx" ON "AdsStats"("integrationId", "date");
CREATE INDEX IF NOT EXISTS "AdsStats_productId_date_idx" ON "AdsStats"("productId", "date");
CREATE INDEX IF NOT EXISTS "SeoSnapshot_productId_date_idx" ON "SeoSnapshot"("productId", "date");
CREATE INDEX IF NOT EXISTS "Alert_integrationId_resolved_idx" ON "Alert"("integrationId", "resolved");
CREATE INDEX IF NOT EXISTS "Alert_type_severity_idx" ON "Alert"("type", "severity");
CREATE INDEX IF NOT EXISTS "DailyKPI_integrationId_date_idx" ON "DailyKPI"("integrationId", "date");
CREATE INDEX IF NOT EXISTS "ProductAnalytics_productId_date_idx" ON "ProductAnalytics"("productId", "date");

-- Добавление внешних ключей
ALTER TABLE "MarketplaceIntegration" ADD CONSTRAINT "MarketplaceIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "MarketplaceIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "MarketplaceIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Fee" ADD CONSTRAINT "Fee_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "MarketplaceIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdsStats" ADD CONSTRAINT "AdsStats_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "MarketplaceIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdsStats" ADD CONSTRAINT "AdsStats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SeoSnapshot" ADD CONSTRAINT "SeoSnapshot_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "MarketplaceIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SeoSnapshot" ADD CONSTRAINT "SeoSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Alert" ADD CONSTRAINT "Alert_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "MarketplaceIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TelegramUser" ADD CONSTRAINT "TelegramUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "NotificationRule" ADD CONSTRAINT "NotificationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DailyKPI" ADD CONSTRAINT "DailyKPI_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "MarketplaceIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductAnalytics" ADD CONSTRAINT "ProductAnalytics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Создание уникальных индексов
CREATE UNIQUE INDEX IF NOT EXISTS "TelegramUser_telegramId_key" ON "TelegramUser"("telegramId");
