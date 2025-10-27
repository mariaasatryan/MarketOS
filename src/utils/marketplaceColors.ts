// Цветовая схема для маркетплейсов
export const getMarketplaceColors = (marketplace: string) => {
  switch (marketplace.toLowerCase()) {
    case 'wb':
    case 'wildberries':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-800',
        icon: 'text-purple-600'
      };
    case 'ozon':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-600'
      };
    case 'yamarket':
    case 'yandex market':
    case 'ya_market':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: 'text-yellow-600'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800',
        icon: 'text-gray-600'
      };
  }
};

// Цвета для кнопок синхронизации (синие вместо зеленых)
export const getSyncButtonColors = () => {
  return {
    primary: 'bg-blue-500 hover:bg-blue-700',
    secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    outline: 'border-blue-500 text-blue-500 hover:bg-blue-50'
  };
};

// Цвета для статусов
export const getStatusColors = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'info':
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
