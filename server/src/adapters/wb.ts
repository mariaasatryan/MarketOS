import { httpJSON } from './http';

export async function wbKPIs(range:{from:string;to:string}, token:string) {
  // пример: вызов статистики WB
  const url = `https://suppliers-api.wildberries.ru/...`;
  return httpJSON(url, { headers: { Authorization: token }});
}