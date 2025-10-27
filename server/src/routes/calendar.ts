import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';
import { upsertSupplyWithReminderWB } from '../services/calendarService';

export async function calendarRoutes(app: FastifyInstance) {
  app.get('/api/calendar', { preValidation:[app.auth] }, async (req:any) => {
    const items = await prisma.calendarEvent.findMany({ where: { userId: req.user.sub }, orderBy:{ startsAt: 'asc' }});
    return items;
  });

  app.post('/api/calendar/supply-wb', { preValidation:[app.auth] }, async (req:any) => {
    const body = z.object({ title: z.string(), date: z.string() }).parse(req.body);
    const startsAt = new Date(body.date);
    const ev = await upsertSupplyWithReminderWB(req.user.sub, body.title, startsAt);
    return { ok:true, id: ev.id };
  });

  app.post('/api/calendar/custom', { preValidation:[app.auth] }, async (req:any) => {
    const body = z.object({
      title: z.string(), type: z.enum(['custom','deadline','shipment']),
      date: z.string()
    }).parse(req.body);
    const ev = await prisma.calendarEvent.create({
      data: { userId:req.user.sub, title:body.title, type: body.type, startsAt:new Date(body.date) }
    });
    return { ok:true, id: ev.id };
  });
}