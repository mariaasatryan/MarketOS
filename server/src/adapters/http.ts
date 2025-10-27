import fetch from 'node-fetch';

export async function httpJSON(url: string, opts: any = {}, retries = 2): Promise<any> {
  try {
    const res = await fetch(url, { ...opts, timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    return await res.json();
  } catch (e) {
    if (retries > 0) return httpJSON(url, opts, retries - 1);
    throw e;
  }
}