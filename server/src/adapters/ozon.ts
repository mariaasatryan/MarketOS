import { httpJSON } from './http';
import { env } from '../utils/env';

export async function ozonKPIs(range:{from:string;to:string}, creds:{clientId:string; apiKey:string}) {
  // пример: ozon analytics (зависит от реальных эндпоинтов)
  const url = `${env.OZON_API_BASE}/v1/analytics/metrics`;
  const body = { date_from: range.from, date_to: range.to };
  return httpJSON(url, {
    method: 'POST',
    headers: {
      'Client-Id': creds.clientId,
      'Api-Key': creds.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}