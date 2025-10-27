import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../services/analyticsService';
import { ETLService } from '../services/etlService';
import { Marketplace } from '@prisma/client';

export async function analyticsRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const analyticsService = new AnalyticsService(prisma);
  const etlService = new ETLService(prisma);

  // Middleware для проверки аутентификации
  fastify.addHook('preHandler', async (request, reply) => {
    // Здесь должна быть проверка JWT токена
    // Пока что используем заглушку
    const userId = request.headers['x-user-id'] as string;
    if (!userId) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }
    (request as any).userId = userId;
  });

  // GET /kpi - получение KPI данных
  fastify.get('/kpi', async (request, reply) => {
    try {
      const { from, to, marketplace } = request.query as {
        from?: string;
        to?: string;
        marketplace?: Marketplace;
      };

      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const kpiData = await analyticsService.getKPIData(
        (request as any).userId,
        fromDate,
        toDate,
        marketplace
      );

      return kpiData;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /pnl - получение P&L данных
  fastify.get('/pnl', async (request, reply) => {
    try {
      const { from, to, groupBy, marketplace } = request.query as {
        from?: string;
        to?: string;
        groupBy?: 'sku' | 'category' | 'marketplace';
        marketplace?: Marketplace;
      };

      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const pnlData = await analyticsService.getPnLData(
        (request as any).userId,
        fromDate,
        toDate,
        groupBy || 'sku',
        marketplace
      );

      return pnlData;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /inventory/dead-stock - получение данных о замороженных товарах
  fastify.get('/inventory/dead-stock', async (request, reply) => {
    try {
      const { thresholdDays, marketplace } = request.query as {
        thresholdDays?: string;
        marketplace?: Marketplace;
      };

      const threshold = thresholdDays ? parseInt(thresholdDays) : 30;

      const deadStockData = await analyticsService.getDeadStockData(
        (request as any).userId,
        threshold,
        marketplace
      );

      return deadStockData;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /inventory/hidden-losses - получение данных о скрытых потерях
  fastify.get('/inventory/hidden-losses', async (request, reply) => {
    try {
      const { from, to, marketplace } = request.query as {
        from?: string;
        to?: string;
        marketplace?: Marketplace;
      };

      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const hiddenLossData = await analyticsService.getHiddenLossData(
        (request as any).userId,
        fromDate,
        toDate,
        marketplace
      );

      return hiddenLossData;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /ads/summary - получение сводки по рекламе
  fastify.get('/ads/summary', async (request, reply) => {
    try {
      const { from, to, marketplace } = request.query as {
        from?: string;
        to?: string;
        marketplace?: Marketplace;
      };

      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const adsData = await analyticsService.getAdsPerformanceData(
        (request as any).userId,
        fromDate,
        toDate,
        marketplace
      );

      return adsData;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /seo/summary - получение сводки по SEO
  fastify.get('/seo/summary', async (request, reply) => {
    try {
      const { from, to, marketplace } = request.query as {
        from?: string;
        to?: string;
        marketplace?: Marketplace;
      };

      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const seoData = await analyticsService.getSEOData(
        (request as any).userId,
        fromDate,
        toDate,
        marketplace
      );

      return seoData;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /alerts - получение уведомлений
  fastify.get('/alerts', async (request, reply) => {
    try {
      const { resolved, type, severity } = request.query as {
        resolved?: string;
        type?: string;
        severity?: string;
      };

      const whereClause: any = {
        integration: {
          userId: (request as any).userId
        }
      };

      if (resolved !== undefined) {
        whereClause.resolved = resolved === 'true';
      }

      if (type) {
        whereClause.type = type;
      }

      if (severity) {
        whereClause.severity = severity;
      }

      const alerts = await prisma.alert.findMany({
        where: whereClause,
        include: {
          product: true,
          integration: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      return alerts;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /alerts/:id/resolve - разрешение уведомления
  fastify.post('/alerts/:id/resolve', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const alert = await prisma.alert.update({
        where: { id },
        data: { resolved: true }
      });

      return alert;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /integrations - создание интеграции
  fastify.post('/integrations', async (request, reply) => {
    try {
      const { marketplace, name, apiKey, settings } = request.body as {
        marketplace: Marketplace;
        name: string;
        apiKey: string;
        settings?: any;
      };

      const integrationId = await etlService.createIntegration(
        (request as any).userId,
        marketplace,
        name,
        apiKey,
        settings
      );

      return { id: integrationId };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // PUT /integrations/:id - обновление интеграции
  fastify.put('/integrations/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as {
        name?: string;
        isActive?: boolean;
        settings?: any;
      };

      await etlService.updateIntegration(id, updates);

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // DELETE /integrations/:id - удаление интеграции
  fastify.delete('/integrations/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await etlService.deleteIntegration(id);

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /sync - принудительная синхронизация
  fastify.post('/sync', async (request, reply) => {
    try {
      const { integrationId } = request.body as { integrationId?: string };

      if (integrationId) {
        await etlService.syncIntegration(integrationId);
      } else {
        await etlService.syncAllIntegrations();
      }

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /alerts/generate - генерация уведомлений
  fastify.post('/alerts/generate', async (request, reply) => {
    try {
      await analyticsService.generateAlerts((request as any).userId);

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /dashboard - получение данных для дашборда
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const { from, to } = request.query as {
        from?: string;
        to?: string;
      };

      const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(to) : new Date();

      const [kpiData, deadStockData, hiddenLossData, adsData, seoData, alerts] = await Promise.all([
        analyticsService.getKPIData((request as any).userId, fromDate, toDate),
        analyticsService.getDeadStockData((request as any).userId, 30),
        analyticsService.getHiddenLossData((request as any).userId, fromDate, toDate),
        analyticsService.getAdsPerformanceData((request as any).userId, fromDate, toDate),
        analyticsService.getSEOData((request as any).userId, fromDate, toDate),
        prisma.alert.findMany({
          where: {
            integration: { userId: (request as any).userId },
            resolved: false
          },
          include: { product: true, integration: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      return {
        kpi: kpiData,
        deadStock: deadStockData.slice(0, 10),
        hiddenLosses: hiddenLossData.slice(0, 10),
        ads: adsData.slice(0, 10),
        seo: seoData.slice(0, 10),
        alerts
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
