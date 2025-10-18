export const marketplaces = ['WB', 'Ozon', 'YaMarket', 'SMM'] as const;
export type Marketplace = typeof marketplaces[number];

export const mpColors: Record<Marketplace, string> = {
  WB: 'bg-purple-100 text-purple-700 border-purple-200',
  Ozon: 'bg-blue-100 text-blue-700 border-blue-200',
  YaMarket: 'bg-amber-100 text-amber-700 border-amber-200',
  SMM: 'bg-green-100 text-green-700 border-green-200',
};

export const mpNames: Record<Marketplace, string> = {
  WB: 'Wildberries',
  Ozon: 'Ozon',
  YaMarket: 'Яндекс Маркет',
  SMM: 'СберМегаМаркет',
};
