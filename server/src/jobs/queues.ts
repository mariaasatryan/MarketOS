import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../utils/env';
import { prisma } from '../db';
// сюда импортируй сервисы адаптеров и агрегатор, если нужно

const conn = new IORedis(env.REDIS_URL);
export const syncQueue = new Queue('sync', { connection: conn });

// пример воркера
export const syncWorker = new Worker('sync', async job => {
  const { userId } = job.data;
  // подтянуть свежие KPI, отзывы и т.п. и сложить в кэш/таблицы
  // await refreshUserData(userId)
}, { connection: conn });

// планировщик: раз в 15 минут
export async function scheduleSync(userId:string) {
  await syncQueue.add('user-sync', { userId }, { repeat: { every: 15 * 60 * 1000 }});
}