# 🔗 Реальная интеграция с API маркетплейсов

## ✅ **Исправлено: Теперь используется реальный API вместо мок-данных!**

### **Что было изменено:**

## **1. 🚀 Создан RealMarketplaceService**

### **Wildberries API интеграция:**
- ✅ **Заказы**: `https://suppliers-api.wildberries.ru/api/v3/orders`
- ✅ **Остатки**: `https://suppliers-api.wildberries.ru/api/v3/stocks`  
- ✅ **Товары**: `https://suppliers-api.wildberries.ru/content/v1/cards/cursor/list`
- ✅ **Продажи**: `https://statistics-api.wildberries.ru/api/v1/supplier/sales`

### **Ozon API интеграция:**
- ✅ **Заказы**: `https://api-seller.ozon.ru/v3/posting/fbs/list`
- ✅ **Товары**: `https://api-seller.ozon.ru/v2/product/list`

### **Яндекс.Маркет API интеграция:**
- ✅ **Кампании**: `https://api.partner.market.yandex.ru/v2/campaigns`
- ✅ **Заказы**: `https://api.partner.market.yandex.ru/v2/campaigns/{id}/orders`
- ✅ **Товары**: `https://api.partner.market.yandex.ru/v2/campaigns/{id}/offers`

## **2. 📊 Обновлены все страницы**

### **Dashboard:**
- ✅ Использует `RealMarketplaceService.getRealKPIData()`
- ✅ Получает реальные данные: товары, заказы, выручка, остатки
- ✅ Детализация по каждому маркетплейсу

### **Analytics:**
- ✅ Использует `RealMarketplaceService.getRealAnalyticsData()`
- ✅ Реальные данные продаж за 30 дней
- ✅ Топ товары с реальными остатками

### **Products:**
- ✅ Использует `RealMarketplaceService.getRealProductsData()`
- ✅ Список товаров с реальными ценами и остатками
- ✅ Данные из всех подключенных маркетплейсов

## **3. 🔧 Правильные API эндпоинты**

### **Wildberries API (согласно документации):**

```typescript
// Заказы
GET https://suppliers-api.wildberries.ru/api/v3/orders
Headers: { Authorization: "your-api-token" }
Params: { dateFrom, dateTo, status }

// Остатки  
GET https://suppliers-api.wildberries.ru/api/v3/stocks
Headers: { Authorization: "your-api-token" }

// Карточки товаров
POST https://suppliers-api.wildberries.ru/content/v1/cards/cursor/list
Headers: { Authorization: "your-api-token" }
Body: { sort: { cursor: { limit: 1000 } } }

// Продажи
GET https://statistics-api.wildberries.ru/api/v1/supplier/sales
Headers: { Authorization: "your-api-token" }
Params: { dateFrom, dateTo }
```

### **Ozon API:**

```typescript
// Заказы
POST https://api-seller.ozon.ru/v3/posting/fbs/list
Headers: { 
  "Api-Key": "your-api-key",
  "Client-Id": "your-client-id" 
}
Body: { filter: { since, to }, limit: 1000 }

// Товары
POST https://api-seller.ozon.ru/v2/product/list
Headers: { 
  "Api-Key": "your-api-key", 
  "Client-Id": "your-client-id" 
}
Body: { filter: {}, limit: 1000 }
```

### **Яндекс.Маркет API:**

```typescript
// Кампании
GET https://api.partner.market.yandex.ru/v2/campaigns
Headers: { Authorization: "OAuth your-token" }

// Заказы по кампании
GET https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/orders
Headers: { Authorization: "OAuth your-token" }

// Товары по кампании
GET https://api.partner.market.yandex.ru/v2/campaigns/{campaignId}/offers
Headers: { Authorization: "OAuth your-token" }
```

## **4. 🎯 Как это работает:**

### **Без API токенов:**
- Все метрики показывают **0**
- Отображается сообщение "Подключите маркетплейс"

### **С API токенами:**
1. **Загружаются интеграции** из `marketplaceService`
2. **Для каждой активной интеграции** делаются запросы к API
3. **Данные агрегируются** по всем маркетплейсам
4. **Отображаются реальные метрики** в интерфейсе

### **Пример работы с Wildberries:**

```typescript
// 1. Получаем заказы за последние 30 дней
const orders = await RealMarketplaceService.getWBOrders(
  apiToken, 
  '2024-01-01', 
  '2024-01-31'
);

// 2. Получаем остатки товаров
const stocks = await RealMarketplaceService.getWBStocks(apiToken);

// 3. Получаем карточки товаров
const products = await RealMarketplaceService.getWBProducts(apiToken);

// 4. Получаем данные продаж
const sales = await RealMarketplaceService.getWBSales(
  apiToken, 
  '2024-01-01', 
  '2024-01-31'
);
```

## **5. 🔄 Процесс синхронизации:**

1. **Пользователь нажимает "Синхронизировать"**
2. **Система загружает все активные интеграции**
3. **Для каждой интеграции делаются API запросы:**
   - Wildberries: заказы, остатки, товары, продажи
   - Ozon: заказы, товары (требует Client ID)
   - Яндекс.Маркет: кампании → заказы и товары
4. **Данные агрегируются и сохраняются**
5. **Интерфейс обновляется с реальными данными**

## **6. 📈 Результат:**

### **Теперь вы получаете:**
- ✅ **Реальные заказы** из API маркетплейсов
- ✅ **Актуальные остатки** товаров
- ✅ **Точную выручку** по продажам
- ✅ **Список товаров** с реальными ценами
- ✅ **Аналитику продаж** за 30 дней
- ✅ **Детализацию по маркетплейсам**

### **Источники данных:**
- **Wildberries**: [Официальная документация](https://dev.wildberries.ru/swagger/)
- **Ozon**: [API документация](https://docs.ozon.ru/api/seller/)
- **Яндекс.Маркет**: [API документация](https://yandex.ru/dev/market/partner-api/)

## **7. 🚨 Важные замечания:**

### **Wildberries:**
- Требует API токен из ЛК поставщика
- Некоторые методы требуют дополнительных соглашений
- Лимиты на количество запросов

### **Ozon:**
- Требует API ключ + Client ID
- Разные эндпоинты для разных типов данных
- OAuth авторизация

### **Яндекс.Маркет:**
- Требует OAuth токен
- Работа через кампании
- Нужны права на доступ к данным

## **🎉 Теперь ваше приложение работает с реальными данными API маркетплейсов!**

**Больше никаких мок-данных - только реальная информация из ваших аккаунтов на маркетплейсах! 🚀**
