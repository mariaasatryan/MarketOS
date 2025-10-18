import { prisma } from '../db';
import { decrypt } from '../utils/crypto';
import { ozonKPIs } from '../adapters/ozon';
import { wbKPIs } from '../adapters/wb';
import { ymKPIs } from '../adapters/ym';

type ByMp = { WB: number; Ozon: number; YaMarket: number };
export async function getAggregatedKPI(userId: string, range:{from:string; to:string}) {
  const tokens = await prisma.token.findMany({ where: { userId }});
  const by: ByMp = { WB:0, Ozon:0, YaMarket:0 };
  let orders=0, revenue=0, stock=0;

  for (const t of tokens) {
    const raw = await decrypt(Buffer.from(t.encValue));
    if (t.marketplace === 'Ozon') {
      const { clientId, apiKey } = JSON.parse(raw);
      const k = await ozonKPIs(range, { clientId, apiKey });
      // TODO: распарсить в нормализованный формат
      // пример:
      by.Ozon += k.orders;
      orders += k.orders; revenue += k.revenue; stock += k.stock;
    }
    if (t.marketplace === 'WB') {
      const k = await wbKPIs(range, raw);
      by.WB += k.orders; orders += k.orders; revenue += k.revenue; stock += k.stock;
    }
    if (t.marketplace === 'YaMarket') {
      const k = await ymKPIs(range, raw);
      by.YaMarket += k.orders; orders += k.orders; revenue += k.revenue; stock += k.stock;
    }
  }

  return {
    orders:  { total: orders,  by_mp: by },
    revenue: { total: revenue, by_mp: by },
    stock:   { total: stock,   by_mp: by }
  };
}