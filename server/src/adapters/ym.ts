import { httpJSON } from './http';

export async function ymKPIs(range:{from:string;to:string}, token:string) {
  const url = `https://api.partner.market.yandex.ru/...`;
  return httpJSON(url, { headers: { Authorization: `Bearer ${token}` }});
}