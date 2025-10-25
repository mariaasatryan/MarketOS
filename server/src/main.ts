import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { analyticsRoutes } from './routes/analytics';
import { TelegramBot } from './bot/telegramBot';
import { CronJobs } from './jobs/cronJobs';

const fastify = Fastify({
  logger: true
});

const prisma = new PrismaClient();

// Регистрация маршрутов
fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

// Инициализация Telegram бота
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || 'demo_token');

// Инициализация CRON задач
const cronJobs = new CronJobs(telegramBot);

// Запуск сервера
const start = async () => {
  try {
    // Подключение к базе данных
    await prisma.$connect();
    console.log('Connected to database');

    // Запуск Telegram бота
    await telegramBot.start();
    console.log('Telegram bot started');

    // Запуск CRON задач
    cronJobs.startAllJobs();
    console.log('Cron jobs started');

    // Запуск сервера
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await telegramBot.stop();
    cronJobs.stopAllJobs();
    await prisma.$disconnect();
    await fastify.close();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    await telegramBot.stop();
    cronJobs.stopAllJobs();
    await prisma.$disconnect();
    await fastify.close();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

start();