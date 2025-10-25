# Обновление цветовой схемы MarketOS

## 🎨 Новая цветовая схема

### Маркетплейсы:
- **Wildberries (WB)**: 🟣 Сиреневый (`purple-100`, `purple-600`)
- **Ozon**: 🔵 Синий (`blue-100`, `blue-600`) 
- **Яндекс.Маркет**: 🟡 Желтый (`yellow-100`, `yellow-600`)

### Кнопки синхронизации:
- **Основные кнопки**: 🔵 Синие (`blue-500`, `blue-700`) вместо зеленых
- **Вторичные кнопки**: 🔵 Светло-синие (`blue-100`, `blue-200`)
- **Контурные кнопки**: 🔵 Синие контуры (`border-blue-500`, `text-blue-500`)

## 📁 Обновленные файлы:

### Новые утилиты:
- ✅ `src/utils/marketplaceColors.ts` - Цветовая схема для маркетплейсов
- ✅ `src/components/MarketplaceBadge.tsx` - Бейджи маркетплейсов
- ✅ `src/components/SyncButton.tsx` - Кнопки синхронизации
- ✅ `src/components/MarketplaceStats.tsx` - Статистика по маркетплейсам

### Обновленные страницы:
- ✅ `src/pages/AnalyticsDashboard.tsx` - Аналитический дашборд
- ✅ `src/pages/PnLReport.tsx` - P&L отчеты
- ✅ `src/pages/InventoryManagement.tsx` - Управление остатками
- ✅ `src/components/LayoutDraggable.tsx` - Навигация

## 🎯 Использование:

### MarketplaceBadge:
```tsx
import MarketplaceBadge from '../components/MarketplaceBadge';

<MarketplaceBadge marketplace="WB" />
<MarketplaceBadge marketplace="Ozon" />
<MarketplaceBadge marketplace="Yandex Market" />
```

### SyncButton:
```tsx
import SyncButton from '../components/SyncButton';

<SyncButton onClick={handleSync} variant="primary">
  Синхронизировать
</SyncButton>

<SyncButton onClick={handleSync} variant="secondary" size="sm">
  Обновить
</SyncButton>
```

### MarketplaceStats:
```tsx
import MarketplaceStats from '../components/MarketplaceStats';

<MarketplaceStats stats={[
  { marketplace: 'WB', orders: 100, revenue: 50000, profit: 10000, roas: 3.2 },
  { marketplace: 'Ozon', orders: 80, revenue: 40000, profit: 8000, roas: 2.8 },
  { marketplace: 'Yandex Market', orders: 60, revenue: 30000, profit: 6000, roas: 2.5 }
]} />
```

## 🎨 Цветовые классы:

### Wildberries (WB):
- Фон: `bg-purple-100`
- Текст: `text-purple-600`
- Граница: `border-purple-200`
- Бейдж: `bg-purple-100 text-purple-800`

### Ozon:
- Фон: `bg-blue-100`
- Текст: `text-blue-600`
- Граница: `border-blue-200`
- Бейдж: `bg-blue-100 text-blue-800`

### Яндекс.Маркет:
- Фон: `bg-yellow-100`
- Текст: `text-yellow-600`
- Граница: `border-yellow-200`
- Бейдж: `bg-yellow-100 text-yellow-800`

### Кнопки синхронизации:
- Основная: `bg-blue-500 hover:bg-blue-700`
- Вторичная: `bg-blue-100 hover:bg-blue-200 text-blue-700`
- Контурная: `border-blue-500 text-blue-500 hover:bg-blue-50`

## ✨ Результат:

Теперь все компоненты MarketOS используют единую цветовую схему:
- 🟣 **Wildberries** - сиреневый
- 🔵 **Ozon** - синий  
- 🟡 **Яндекс.Маркет** - желтый
- 🔵 **Кнопки синхронизации** - синие

Цвета светлые и приятные для глаз, обеспечивают хорошую читаемость и визуальное разделение между маркетплейсами.
