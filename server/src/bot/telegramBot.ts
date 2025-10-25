import { Telegraf, Context } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../services/analyticsService';
import { ETLService } from '../services/etlService';
import { Marketplace } from '@prisma/client';

export class TelegramBot {
  private bot: Telegraf;
  private prisma: PrismaClient;
  private analyticsService: AnalyticsService;
  private etlService: ETLService;

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.prisma = new PrismaClient();
    this.analyticsService = new AnalyticsService(this.prisma);
    this.etlService = new ETLService(this.prisma);
    
    this.setupCommands();
  }

  private setupCommands() {
    // Команда /start
    this.bot.start(async (ctx) => {
      const telegramId = ctx.from?.id.toString();
      if (!telegramId) return;

      const user = await this.prisma.telegramUser.findUnique({
        where: { telegramId },
        include: { User: true }
      });

      if (user) {
        await ctx.reply(
          `Привет, ${user.User.name || 'пользователь'}! 👋\n\n` +
          `Я бот MarketOS - ваш помощник по аналитике маркетплейсов.\n\n` +
          `Доступные команды:\n` +
          `/kpi_today - KPI за сегодня\n` +
          `/top_loss - Топ убыточных товаров\n` +
          `/dead_stock - Замороженные товары\n` +
          `/ads_alerts - Рекламные уведомления\n` +
          `/seo_status - SEO статус\n` +
          `/help - Помощь`
        );
      } else {
        await ctx.reply(
          'Привет! 👋\n\n' +
          'Для использования бота необходимо авторизоваться в системе MarketOS.\n' +
          'Пожалуйста, перейдите в настройки приложения и привяжите Telegram аккаунт.'
        );
      }
    });

    // Команда /help
    this.bot.help(async (ctx) => {
      await ctx.reply(
        '📊 MarketOS Bot - Команды:\n\n' +
        '/kpi_today - Основные показатели за сегодня\n' +
        '/top_loss - Товары с наибольшими потерями\n' +
        '/dead_stock - Замороженные товары\n' +
        '/ads_alerts - Уведомления по рекламе\n' +
        '/seo_status - Статус SEO позиций\n' +
        '/sync - Принудительная синхронизация\n' +
        '/help - Эта справка\n\n' +
        '💡 Все команды работают с данными ваших интеграций.'
      );
    });

    // Команда /kpi_today
    this.bot.command('kpi_today', async (ctx) => {
      try {
        const user = await this.getUserByTelegramId(ctx);
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const kpiData = await this.analyticsService.getKPIData(
          user.userId,
          today,
          tomorrow
        );

        const message = 
          `📊 KPI за сегодня:\n\n` +
          `💰 Выручка: ${this.formatCurrency(kpiData.revenue)}\n` +
          `📦 Заказы: ${kpiData.orders}\n` +
          `💵 Прибыль: ${this.formatCurrency(kpiData.profit)}\n` +
          `📈 ROAS: ${kpiData.roas.toFixed(2)}\n` +
          `📊 Маржа: ${(kpiData.margin * 100).toFixed(1)}%\n` +
          `📦 Остатки: ${kpiData.stock} шт.\n` +
          `💸 Реклама: ${this.formatCurrency(kpiData.adsSpend)}\n` +
          `🏪 Комиссии: ${this.formatCurrency(kpiData.fees)}`;

        await ctx.reply(message);
      } catch (error) {
        console.error('Error in kpi_today command:', error);
        await ctx.reply('❌ Ошибка при получении KPI данных');
      }
    });

    // Команда /top_loss
    this.bot.command('top_loss', async (ctx) => {
      try {
        const user = await this.getUserByTelegramId(ctx);
        if (!user) return;

        const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = new Date();

        const hiddenLossData = await this.analyticsService.getHiddenLossData(
          user.userId,
          fromDate,
          toDate
        );

        const topLosses = hiddenLossData.slice(0, 5);

        if (topLosses.length === 0) {
          await ctx.reply('✅ Скрытых потерь не обнаружено');
          return;
        }

        let message = '🔍 Топ скрытых потерь:\n\n';
        
        topLosses.forEach((loss, index) => {
          message += 
            `${index + 1}. ${loss.sku}\n` +
            `💸 Потери: ${this.formatCurrency(loss.totalHiddenLoss)}\n` +
            `📊 Влияние: ${(loss.profitImpact * 100).toFixed(1)}%\n\n`;
        });

        await ctx.reply(message);
      } catch (error) {
        console.error('Error in top_loss command:', error);
        await ctx.reply('❌ Ошибка при получении данных о потерях');
      }
    });

    // Команда /dead_stock
    this.bot.command('dead_stock', async (ctx) => {
      try {
        const user = await this.getUserByTelegramId(ctx);
        if (!user) return;

        const deadStockData = await this.analyticsService.getDeadStockData(
          user.userId,
          30
        );

        const deadStock = deadStockData.filter(item => item.isDeadStock).slice(0, 5);

        if (deadStock.length === 0) {
          await ctx.reply('✅ Замороженных товаров не найдено');
          return;
        }

        let message = '🧊 Замороженные товары:\n\n';
        
        deadStock.forEach((item, index) => {
          message += 
            `${index + 1}. ${item.sku}\n` +
            `📦 Остаток: ${item.stock} шт.\n` +
            `⏰ Дней без продаж: ${item.daysSinceLastSale}\n` +
            `📊 Оборачиваемость: ${(item.sellThrough * 100).toFixed(1)}%\n\n`;
        });

        await ctx.reply(message);
      } catch (error) {
        console.error('Error in dead_stock command:', error);
        await ctx.reply('❌ Ошибка при получении данных о замороженных товарах');
      }
    });

    // Команда /ads_alerts
    this.bot.command('ads_alerts', async (ctx) => {
      try {
        const user = await this.getUserByTelegramId(ctx);
        if (!user) return;

        const alerts = await this.prisma.alert.findMany({
          where: {
            integration: { userId: user.userId },
            type: { in: ['LOW_ROAS', 'CAMPAIGN_CONFLICT'] },
            resolved: false
          },
          include: { product: true, integration: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        if (alerts.length === 0) {
          await ctx.reply('✅ Рекламных уведомлений нет');
          return;
        }

        let message = '📢 Рекламные уведомления:\n\n';
        
        alerts.forEach((alert, index) => {
          const emoji = this.getAlertEmoji(alert.severity);
          message += 
            `${emoji} ${alert.message}\n` +
            `📅 ${alert.date.toLocaleDateString('ru-RU')}\n\n`;
        });

        await ctx.reply(message);
      } catch (error) {
        console.error('Error in ads_alerts command:', error);
        await ctx.reply('❌ Ошибка при получении рекламных уведомлений');
      }
    });

    // Команда /seo_status
    this.bot.command('seo_status', async (ctx) => {
      try {
        const user = await this.getUserByTelegramId(ctx);
        if (!user) return;

        const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const toDate = new Date();

        const seoData = await this.analyticsService.getSEOData(
          user.userId,
          fromDate,
          toDate
        );

        const topSeo = seoData.slice(0, 5);

        if (topSeo.length === 0) {
          await ctx.reply('📊 SEO данных пока нет');
          return;
        }

        let message = '🔍 SEO статус:\n\n';
        
        topSeo.forEach((item, index) => {
          message += 
            `${index + 1}. ${item.sku}\n` +
            `📍 Средняя позиция: ${item.avgPosition}\n` +
            `🔍 Запросов: ${item.totalQueries}\n` +
            `📈 Конверсия: ${(item.avgConversion * 100).toFixed(1)}%\n\n`;
        });

        await ctx.reply(message);
      } catch (error) {
        console.error('Error in seo_status command:', error);
        await ctx.reply('❌ Ошибка при получении SEO данных');
      }
    });

    // Команда /sync
    this.bot.command('sync', async (ctx) => {
      try {
        const user = await this.getUserByTelegramId(ctx);
        if (!user) return;

        await ctx.reply('🔄 Начинаю синхронизацию...');

        await this.etlService.syncAllIntegrations();

        await ctx.reply('✅ Синхронизация завершена');
      } catch (error) {
        console.error('Error in sync command:', error);
        await ctx.reply('❌ Ошибка при синхронизации');
      }
    });

    // Обработка неизвестных команд
    this.bot.on('text', async (ctx) => {
      await ctx.reply(
        '❓ Неизвестная команда. Используйте /help для просмотра доступных команд.'
      );
    });
  }

  private async getUserByTelegramId(ctx: Context): Promise<any> {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return null;

    return await this.prisma.telegramUser.findUnique({
      where: { telegramId },
      include: { User: true }
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private getAlertEmoji(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '🔶';
      case 'LOW': return 'ℹ️';
      default: return '📢';
    }
  }

  // Метод для отправки push-уведомлений
  async sendAlertNotification(userId: string, alert: any): Promise<void> {
    try {
      const telegramUser = await this.prisma.telegramUser.findFirst({
        where: { 
          userId,
          isActive: true 
        }
      });

      if (!telegramUser) return;

      const emoji = this.getAlertEmoji(alert.severity);
      const message = `${emoji} ${alert.message}`;

      await this.bot.telegram.sendMessage(telegramUser.telegramId, message);
    } catch (error) {
      console.error('Error sending alert notification:', error);
    }
  }

  // Метод для отправки ежедневного отчета
  async sendDailyReport(userId: string): Promise<void> {
    try {
      const telegramUser = await this.prisma.telegramUser.findFirst({
        where: { 
          userId,
          isActive: true 
        }
      });

      if (!telegramUser) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const kpiData = await this.analyticsService.getKPIData(
        userId,
        today,
        tomorrow
      );

      const message = 
        `📊 Ежедневный отчет MarketOS\n\n` +
        `💰 Выручка: ${this.formatCurrency(kpiData.revenue)}\n` +
        `📦 Заказы: ${kpiData.orders}\n` +
        `💵 Прибыль: ${this.formatCurrency(kpiData.profit)}\n` +
        `📈 ROAS: ${kpiData.roas.toFixed(2)}\n` +
        `📊 Маржа: ${(kpiData.margin * 100).toFixed(1)}%`;

      await this.bot.telegram.sendMessage(telegramUser.telegramId, message);
    } catch (error) {
      console.error('Error sending daily report:', error);
    }
  }

  // Запуск бота
  async start(): Promise<void> {
    try {
      await this.bot.launch();
      console.log('Telegram bot started');
    } catch (error) {
      console.error('Error starting Telegram bot:', error);
      throw error;
    }
  }

  // Остановка бота
  async stop(): Promise<void> {
    try {
      await this.bot.stop();
      console.log('Telegram bot stopped');
    } catch (error) {
      console.error('Error stopping Telegram bot:', error);
      throw error;
    }
  }
}
