import { FastifyInstance } from 'fastify';
import { getAggregatedKPI } from '../services/kpiService';
import { z } from 'zod';

export async function kpiRoutes(app: FastifyInstance) {
  app.get('/api/kpi', { preValidation: [app.auth] }, async (req:any) => {
    const q = z.object({
      from: z.string(),
      to: z.string(),
    }).parse(req.query);
    const userId = req.user.sub as string;
    const data = await getAggregatedKPI(userId, { from: q.from, to: q.to });
    return data;
  });
}