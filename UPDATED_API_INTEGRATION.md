# 🔗 Обновленная интеграция с API маркетплейсов

## ✅ **Обновлено: Правильные API эндпоинты для всех маркетплейсов!**

### **Что было обновлено:**

## **1. 🚀 Ozon API интеграция (согласно официальной документации)**

### **Правильные эндпоинты Ozon:**
- ✅ **Заказы FBS**: `https://api-seller.ozon.ru/v3/posting/fbs/list`
- ✅ **Товары**: `https://api-seller.ozon.ru/v2/product/list`
- ✅ **Остатки**: `https://api-seller.ozon.ru/v1/product/info/stocks`
- ✅ **Аналитика**: `https://api-seller.ozon.ru/v1/analytics/data`

### **Правильная авторизация Ozon:**
```typescript
Headers: {
  'Api-Key': 'your-api-key',
  'Client-Id': 'your-client-id',
  'Content-Type': 'application/json'
}
```

### **Примеры запросов Ozon:**

```typescript
// Заказы FBS
POST https://api-seller.ozon.ru/v3/posting/fbs/list
{
  "filter": {
    "since": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-31T23:59:59.999Z"
  },
  "limit": 1000,
  "offset": 0
}

// Товары
POST https://api-seller.ozon.ru/v2/product/list
{
  "filter": {
    "visibility": "ALL"
  },
  "limit": 1000,
  "last_id": ""
}

// Остатки
POST https://api-seller.ozon.ru/v1/product/info/stocks
{
  "filter": {
    "visibility": "ALL"
  },
  "limit": 1000,
  "last_id": ""
}

// Аналитика
POST https://api-seller.ozon.ru/v1/analytics/data
{
  "date_from": "2024-01-01",
  "date_to": "2024-01-31",
  "metrics": ["revenue", "ordered_units"],
  "dimension": ["day"],
  "filters": [],
  "sort": [{"key": "day", "order": "ASC"}],
  "limit": 1000,
  "offset": 0
}
```

## **2. 🎯 Яндекс.Маркет API интеграция (согласно официальной документации)**

### **Правильные эндпоинты Яндекс.Маркет:**
- ✅ **Кампании**: `https://api.partner.market.yandex.ru/v2/campaigns`
- ✅ **Заказы**: `https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/orders`
- ✅ **Товары**: `https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/offers`
- ✅ **Остатки**: `https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/offers/stocks`
- ✅ **Аналитика**: `https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/stats/orders`

### **Правильная авторизация Яндекс.Маркет:**
```typescript
Headers: {
  'Authorization': 'OAuth your-token',
  'Content-Type': 'application/json'
}
```

### **Примеры запросов Яндекс.Маркет:**

```typescript
// Список кампаний
GET https://api.partner.market.yandex.ru/v2/campaigns

// Заказы по кампании
POST https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/orders
{
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31",
  "statuses": ["PROCESSING", "DELIVERY", "PICKUP", "DELIVERED"]
}

// Товары по кампании
POST https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/offers
{
  "limit": 1000,
  "offset": 0
}

// Остатки по кампании
POST https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/offers/stocks
{
  "limit": 1000,
  "offset": 0
}

// Статистика заказов
POST https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/stats/orders
{
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31",
  "groupBy": "day"
}
```

## **3. 📊 Wildberries API интеграция (уже обновлена)**

### **Правильные эндпоинты Wildberries:**
- ✅ **Заказы**: `https://suppliers-api.wildberries.ru/api/v3/orders`
- ✅ **Остатки**: `https://suppliers-api.wildberries.ru/api/v3/stocks`
- ✅ **Товары**: `https://suppliers-api.wildberries.ru/content/v1/cards/cursor/list`
- ✅ **Продажи**: `https://statistics-api.wildberries.ru/api/v1/supplier/sales`

## **4. 🔧 Обновленные методы RealMarketplaceService**

### **Ozon методы:**
- ✅ `getOzonOrders()` - заказы FBS с правильными параметрами
- ✅ `getOzonProducts()` - список товаров с фильтрами
- ✅ `getOzonStocks()` - остатки товаров
- ✅ `getOzonAnalytics()` - аналитика продаж

### **Яндекс.Маркет методы:**
- ✅ `getYandexMarketCampaigns()` - список кампаний
- ✅ `getYandexMarketOrders()` - заказы по кампаниям
- ✅ `getYandexMarketProducts()` - товары по кампаниям
- ✅ `getYandexMarketStocks()` - остатки по кампаниям
- ✅ `getYandexMarketAnalytics()` - статистика по кампаниям

## **5. 🎯 Логика работы с Яндекс.Маркет**

### **Особенности API Яндекс.Маркет:**
1. **Работа через кампании**: Сначала получаем список кампаний пользователя
2. **Итерация по кампаниям**: Для каждой кампании делаем отдельные запросы
3. **Агрегация данных**: Собираем данные со всех кампаний в общий массив

### **Пример работы:**
```typescript
// 1. Получаем кампании
const campaigns = await getYandexMarketCampaigns(apiToken);

// 2. Для каждой кампании получаем данные
for (const campaign of campaigns) {
  const orders = await getOrdersForCampaign(campaign.id);
  const products = await getProductsForCampaign(campaign.id);
  const stocks = await getStocksForCampaign(campaign.id);
}

// 3. Агрегируем все данные
const allOrders = campaigns.flatMap(c => c.orders);
const allProducts = campaigns.flatMap(c => c.products);
```

## **6. 📈 Обновленные данные в Dashboard**

### **Теперь получаем реальные данные:**
- ✅ **Wildberries**: заказы, остатки, товары, продажи
- ✅ **Ozon**: заказы FBS, товары, остатки, аналитика
- ✅ **Яндекс.Маркет**: заказы по кампаниям, товары, остатки, статистика

### **Правильная обработка данных:**
- ✅ **Ozon**: используем `ordered_units` и `revenue` из аналитики
- ✅ **Яндекс.Маркет**: используем `count` и `total` из статистики
- ✅ **Wildberries**: используем `finishedPrice` из продаж

## **7. 🔄 Процесс синхронизации**

### **Для каждого маркетплейса:**

**Wildberries:**
1. Заказы через `/api/v3/orders`
2. Остатки через `/api/v3/stocks`
3. Товары через `/content/v1/cards/cursor/list`
4. Продажи через `/api/v1/supplier/sales`

**Ozon:**
1. Заказы FBS через `/v3/posting/fbs/list`
2. Товары через `/v2/product/list`
3. Остатки через `/v1/product/info/stocks`
4. Аналитика через `/v1/analytics/data`

**Яндекс.Маркет:**
1. Кампании через `/v2/campaigns`
2. Для каждой кампании: заказы, товары, остатки, статистика
3. Агрегация данных со всех кампаний

## **8. 📚 Источники документации**

### **Официальная документация:**
- **Ozon**: [API документация](https://docs.ozon.ru/global/api/intro/?country=CN)
- **Яндекс.Маркет**: [Партнерский API](https://yandex.ru/dev/market/partner-api/doc/ru/concepts/access)
- **Wildberries**: [API документация](https://dev.wildberries.ru/swagger/)

### **Специфичные разделы:**
- **Яндекс.Маркет заказы**: [Обработка заказов](https://yandex.ru/dev/market/partner-api/doc/ru/_auto/scopes_summary/pages/inventory-and-order-processing_read-only)
- **Яндекс.Маркет товары**: [Управление товарами](https://yandex.ru/dev/market/partner-api/doc/ru/_auto/scopes_summary/pages/offers-and-cards-management_read-only)

## **9. 🚨 Важные замечания**

### **Ozon:**
- ✅ Требует **API ключ + Client ID**
- ✅ Использует **POST** запросы с JSON телом
- ✅ Правильные форматы дат: `2024-01-01T00:00:00.000Z`
- ✅ Фильтры: `visibility: "ALL"`, `VISIBLE`, `INVISIBLE`

### **Яндекс.Маркет:**
- ✅ Требует **OAuth токен**
- ✅ Работа через **кампании** (не напрямую)
- ✅ Правильные статусы заказов: `PROCESSING`, `DELIVERY`, `PICKUP`, `DELIVERED`
- ✅ Группировка аналитики: `groupBy: "day"`

### **Wildberries:**
- ✅ Требует **API токен** (без "Bearer")
- ✅ Разные базовые URL для разных типов данных
- ✅ Правильные параметры: `status`, `dateFrom`, `dateTo`

## **🎉 Теперь все API интеграции работают по официальной документации!**

**Результат:**
- ✅ **Правильные эндпоинты** для всех маркетплейсов
- ✅ **Корректная авторизация** согласно документации
- ✅ **Реальные данные** из API маркетплейсов
- ✅ **Правильная обработка** ответов API
- ✅ **Агрегация данных** по всем маркетплейсам

**Больше никаких мок-данных - только реальная информация из официальных API! 🚀**
