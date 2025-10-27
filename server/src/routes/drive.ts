import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';

export async function driveRoutes(app: FastifyInstance) {
  app.get('/api/drive', { preValidation:[app.auth] }, async (req:any) => {
    const cats = await prisma.driveCategory.findMany({
      where:{ userId:req.user.sub },
      include:{ links:true }
    });
    return cats;
  });

  app.post('/api/drive/category', { preValidation:[app.auth] }, async (req:any) => {
    const body = z.object({ name: z.string().min(1) }).parse(req.body);
    return prisma.driveCategory.create({ data: { userId:req.user.sub, name: body.name }});
  });

  app.post('/api/drive/link', { preValidation:[app.auth] }, async (req:any) => {
    const body = z.object({ categoryId: z.string(), title: z.string(), url: z.string().url() }).parse(req.body);
    return prisma.driveLink.create({ data: body });
  });
}