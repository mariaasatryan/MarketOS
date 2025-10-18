export async function api<T>(path:string, opts:RequestInit = {}):Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials:'include',
    headers: { 'Content-Type':'application/json', ...(opts.headers||{}) },
    ...opts
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const KpiApi = {
  get: (from:string, to:string) => api(`/kpi?from=${from}&to=${to}`)
};

export const SheetsApi = {
  list: () => api('/sheets'),
  add: (payload:{title:string; url:string; mp?:'WB'|'Ozon'|'YaMarket'}) =>
    api('/sheets', { method:'POST', body: JSON.stringify(payload) })
};

export const DriveApi = {
  list: () => api('/drive'),
  addCategory: (name:string) => api('/drive/category', { method:'POST', body: JSON.stringify({ name })}),
  addLink: (payload:{categoryId:string; title:string; url:string}) =>
    api('/drive/link', { method:'POST', body: JSON.stringify(payload) })
};

export const CalendarApi = {
  list: () => api('/calendar'),
  addSupplyWB: (title:string, date:string) =>
    api('/calendar/supply-wb', { method:'POST', body: JSON.stringify({ title, date })}),
  addCustom: (payload:{title:string; type:'custom'|'deadline'|'shipment'; date:string}) =>
    api('/calendar/custom', { method:'POST', body: JSON.stringify(payload) })
};

export const GoogleApi = {
  startOAuth: () => { window.location.href = '/api/google/oauth/start'; }
};