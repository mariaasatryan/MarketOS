import { prisma } from '../db';
import { addDays } from 'date-fns';

export async function upsertSupplyWithReminderWB(userId:string, title:string, startsAt:Date) {
  const ev = await prisma.calendarEvent.create({
    data: { userId, title, type: 'supply', marketplace: 'WB', startsAt }
  });
  const reminderDate = addDays(startsAt, -4);
  await prisma.calendarEvent.create({
    data: {
      userId, title: 'WB: последний день для бесплатной отмены/переноса',
      type: 'reminder', marketplace: 'WB', startsAt: reminderDate, relatedId: ev.id
    }
  });
  return ev;
}