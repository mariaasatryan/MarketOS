import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';

export async function sheetsRoutes(app: FastifyInstance) {
  app.get('/api/sheets', { preValidation:[app.auth] }, async (req:any) => {
    return prisma.sheetLink.findMany({ where: { userId: req.user.sub }});
  });

  app.post('/api/sheets', { preValidation:[app.auth] }, async (req:any) => {
    const body = z.object({ title:z.string(), url:z.string().url(), mp:z.enum(['WB','Ozon','YaMarket']).optional() }).parse(req.body);
    const row = await prisma.sheetLink.create({ data: { userId: req.user.sub, ...body }});
    return row;
  });
}