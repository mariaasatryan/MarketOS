import { FastifyInstance } from 'fastify';
import { kpiRoutes } from './kpi';
import { sheetsRoutes } from './sheets';
import { driveRoutes } from './drive';
import { calendarRoutes } from './calendar';
import { googleRoutes } from './google';

export async function registerRoutes(app: FastifyInstance) {
  app.get('/api/ping', ()=>({ ok:true }));
  await kpiRoutes(app);
  await sheetsRoutes(app);
  await driveRoutes(app);
  await calendarRoutes(app);
  await googleRoutes(app);
}