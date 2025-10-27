import { PrismaClient } from '@prisma/client';
import { ETLService } from '../services/etlService';
import { AnalyticsService } from '../services/analyticsService';
import { TelegramBot } from '../bot/telegramBot';
import * as cron from 'node-cron';

export class CronJobs {
  private prisma: PrismaClient;
  private etlService: ETLService;
  private analyticsService: AnalyticsService;
  private telegramBot: TelegramBot;

  constructor(telegramBot: TelegramBot) {
    this.prisma = new PrismaClient();
    this.etlService = new ETLService(this.prisma);
    this.analyticsService = new AnalyticsService(this.prisma);
    this.telegramBot = telegramBot;
  }

  // Запуск всех CRON задач
  startAllJobs(): void {
    console.log('Starting all CRON jobs...');

    // Синхронизация данных каждый час
    this.startDataSyncJob();

    // Генерация уведомлений каждые 4 часа
    this.startAlertsGenerationJob();

    // Ежедневный отчет в 9:00
    this.startDailyReportJob();

    // Еженедельный отчет в понедельник в 10:00
    this.startWeeklyReportJob();

    // Очистка старых данных каждый день в 2:00
    this.startDataCleanupJob();

    // Проверка WB поставок каждый день в 8:00
    this.startSupplyCheckJob();

    console.log('All CRON jobs started');
  }

  // Остановка всех CRON задач
  stopAllJobs(): void {
    console.log('Stopping all CRON jobs...');
    cron.getTasks().forEach(task => task.destroy());
    console.log('All CRON jobs stopped');
  }

  // Синхронизация данных каждый час
  private startDataSyncJob(): void {
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('Starting hourly data sync...');
        await this.etlService.syncAllIntegrations();
        console.log('Hourly data sync completed');
      } catch (error) {
        console.error('Error in hourly data sync:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Moscow'
    });
  }

  // Генерация уведомлений каждые 4 часа
  private startAlertsGenerationJob(): void {
    cron.schedule('0 */4 * * *', async () => {
      try {
        console.log('Starting alerts generation...');
        
        const users = await this.prisma.user.findMany({
          where: { telegramUsers: { some: { isActive: true } } }
        });

        for (const user of users) {
          await this.analyticsService.generateAlerts(user.id);
          
          // Отправляем уведомления в Telegram
          const alerts = await this.prisma.alert.findMany({
            where: {
              integration: { userId: user.id },
              resolved: false,
              createdAt: {
                gte: new Date(Date.now() - 4 * 60 * 60 * 1000) // последние 4 часа
              }
            },
            include: { product: true, integration: true }
          });

          for (const alert of alerts) {
            await this.telegramBot.sendAlertNotification(user.id, alert);
          }
        }

        console.log('Alerts generation completed');
      } catch (error) {
        console.error('Error in alerts generation:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Moscow'
    });
  }

  // Ежедневный отчет в 9:00
  private startDailyReportJob(): void {
    cron.schedule('0 9 * * *', async () => {
      try {
        console.log('Starting daily report...');
        
        const users = await this.prisma.user.findMany({
          where: { telegramUsers: { some: { isActive: true } } }
        });

        for (const user of users) {
          await this.telegramBot.sendDailyReport(user.id);
        }

        console.log('Daily report completed');
      } catch (error) {
        console.error('Error in daily report:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Moscow'
    });
  }

  // Еженедельный отчет в понедельник в 10:00
  private startWeeklyReportJob(): void {
    cron.schedule('0 10 * * 1', async () => {
      try {
        console.log('Starting weekly report...');
        
        const users = await this.prisma.user.findMany({
          where: { telegramUsers: { some: { isActive: true } } }
        });

        for (const user of users) {
          await this.sendWeeklyReport(user.id);
        }

        console.log('Weekly report completed');
      } catch (error) {
        console.error('Error in weekly report:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Moscow'
    });
  }

  // Очистка старых данных каждый день в 2:00
  private startDataCleanupJob(): void {
    cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Starting data cleanup...');
        
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 дней назад

        // Удаляем старые уведомления
        await this.prisma.alert.deleteMany({
          where: {
            resolved: true,
            createdAt: { lt: cutoffDate }
          }
        });

        // Удаляем старые SEO снимки
        await this.prisma.seoSnapshot.deleteMany({
          where: {
            date: { lt: cutoffDate }
          }
        });

        // Удаляем старые аналитические данные
        await this.prisma.productAnalytics.deleteMany({
          where: {
            date: { lt: cutoffDate }
          }
        });

        console.log('Data cleanup completed');
      } catch (error) {
        console.error('Error in data cleanup:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Moscow'
    });
  }

  // Проверка WB поставок каждый день в 8:00
  private startSupplyCheckJob(): void {
    cron.schedule('0 8 * * *', async () => {
      try {
        console.log('Starting WB supply check...');
        
        const wbIntegrations = await this.prisma.marketplaceIntegration.findMany({
          where: {
            marketplace: 'WB',
            isActive: true
          },
          include: { User: true }
        });

        for (const integration of wbIntegrations) {
          // Проверяем календарные события на поставки WB
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);

          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

          const supplyEvents = await this.prisma.calendarEvent.findMany({
            where: {
              userId: integration.userId,
              type: 'supply',
              startsAt: {
                gte: tomorrow,
                lt: dayAfterTomorrow
              }
            }
          });

          for (const event of supplyEvents) {
            // Создаем уведомление о последнем дне для отмены поставки
            const alertDate = new Date(event.startsAt);
            alertDate.setDate(alertDate.getDate() - 4); // за 4 дня

            if (alertDate <= new Date()) {
              await this.prisma.alert.create({
                data: {
                  integrationId: integration.id,
                  type: 'SUPPLY_DEADLINE',
                  severity: 'HIGH',
                  message: `WB: Последний день для бесплатной отмены/переноса поставки "${event.title}"`,
                  date: new Date(),
                  meta: {
                    eventId: event.id,
                    eventTitle: event.title,
                    supplyDate: event.startsAt
                  }
                }
              });

              // Отправляем уведомление в Telegram
              await this.telegramBot.sendAlertNotification(integration.userId, {
                severity: 'HIGH',
                message: `🚨 WB: Последний день для бесплатной отмены/переноса поставки "${event.title}"`
              });
            }
          }
        }

        console.log('WB supply check completed');
      } catch (error) {
        console.error('Error in WB supply check:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Moscow'
    });
  }

  // Отправка еженедельного отчета
  private async sendWeeklyReport(userId: string): Promise<void> {
    try {
      const telegramUser = await this.prisma.telegramUser.findFirst({
        where: { 
          userId,
          isActive: true 
        }
      });

      if (!telegramUser) return;

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const now = new Date();

      const [kpiData, deadStockData, hiddenLossData] = await Promise.all([
        this.analyticsService.getKPIData(userId, weekAgo, now),
        this.analyticsService.getDeadStockData(userId, 30),
        this.analyticsService.getHiddenLossData(userId, weekAgo, now)
      ]);

      const deadStockCount = deadStockData.filter(item => item.isDeadStock).length;
      const totalHiddenLoss = hiddenLossData.reduce((sum, item) => sum + item.totalHiddenLoss, 0);

      const message = 
        `📊 Еженедельный отчет MarketOS\n\n` +
        `💰 Выручка: ${this.formatCurrency(kpiData.revenue)}\n` +
        `📦 Заказы: ${kpiData.orders}\n` +
        `💵 Прибыль: ${this.formatCurrency(kpiData.profit)}\n` +
        `📈 ROAS: ${kpiData.roas.toFixed(2)}\n` +
        `📊 Маржа: ${(kpiData.margin * 100).toFixed(1)}%\n\n` +
        `🧊 Замороженных товаров: ${deadStockCount}\n` +
        `💸 Скрытые потери: ${this.formatCurrency(totalHiddenLoss)}`;

      await this.telegramBot['bot'].telegram.sendMessage(telegramUser.telegramId, message);
    } catch (error) {
      console.error('Error sending weekly report:', error);
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
