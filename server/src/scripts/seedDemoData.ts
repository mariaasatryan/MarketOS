import { PrismaClient } from '@prisma/client';
import { Marketplace, FeeType, AlertType, AlertSeverity } from '@prisma/client';

export class DemoDataSeeder {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async seed(): Promise<void> {
    try {
      console.log('Starting demo data seeding...');

      // Создаем тестового пользователя
      const user = await this.createTestUser();

      // Создаем интеграции
      const wbIntegration = await this.createIntegration(user.id, Marketplace.WB, 'WB Main Store');
      const ozonIntegration = await this.createIntegration(user.id, Marketplace.Ozon, 'Ozon Store');
      const ymIntegration = await this.createIntegration(user.id, Marketplace.YaMarket, 'Yandex Market Store');

      // Создаем продукты
      await this.createProducts(wbIntegration.id, ozonIntegration.id, ymIntegration.id);

      // Создаем продажи
      await this.createSales(wbIntegration.id, ozonIntegration.id, ymIntegration.id);

      // Создаем комиссии и штрафы
      await this.createFees(wbIntegration.id, ozonIntegration.id, ymIntegration.id);

      // Создаем рекламную статистику
      await this.createAdsStats(wbIntegration.id, ozonIntegration.id, ymIntegration.id);

      // Создаем SEO снимки
      await this.createSeoSnapshots(wbIntegration.id, ozonIntegration.id, ymIntegration.id);

      // Создаем уведомления
      await this.createAlerts(wbIntegration.id, ozonIntegration.id, ymIntegration.id);

      // Создаем календарные события
      await this.createCalendarEvents(user.id);

      // Создаем Telegram пользователя
      await this.createTelegramUser(user.id);

      console.log('Demo data seeding completed successfully');
    } catch (error) {
      console.error('Error seeding demo data:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async createTestUser() {
    return await this.prisma.user.upsert({
      where: { email: 'demo@marketos.com' },
      update: {},
      create: {
        email: 'demo@marketos.com',
        name: 'Demo User',
        role: 'ADMIN',
        passwordHash: 'demo_password_hash'
      }
    });
  }

  private async createIntegration(userId: string, marketplace: Marketplace, name: string) {
    return await this.prisma.marketplaceIntegration.create({
      data: {
        userId,
        marketplace,
        name,
        settings: {
          apiKey: `demo_api_key_${marketplace.toLowerCase()}`,
          warehouse: 'demo_warehouse'
        }
      }
    });
  }

  private async createProducts(wbIntegrationId: string, ozonIntegrationId: string, ymIntegrationId: string) {
    const products = [
      // WB продукты
      {
        integrationId: wbIntegrationId,
        sku: 'WB-001',
        title: 'Смартфон Samsung Galaxy A54',
        category: 'Смартфоны',
        costPrice: 25000,
        price: 35000,
        stock: 15,
        dimensions: { weight: 0.2, length: 15, width: 7, height: 1 }
      },
      {
        integrationId: wbIntegrationId,
        sku: 'WB-002',
        title: 'Наушники AirPods Pro',
        category: 'Аксессуары',
        costPrice: 12000,
        price: 18000,
        stock: 8,
        dimensions: { weight: 0.05, length: 5, width: 3, height: 2 }
      },
      {
        integrationId: wbIntegrationId,
        sku: 'WB-003',
        title: 'Зарядное устройство USB-C',
        category: 'Аксессуары',
        costPrice: 500,
        price: 1200,
        stock: 0, // замороженный товар
        dimensions: { weight: 0.1, length: 10, width: 5, height: 2 }
      },
      // Ozon продукты
      {
        integrationId: ozonIntegrationId,
        sku: 'OZ-001',
        title: 'Ноутбук ASUS VivoBook 15',
        category: 'Ноутбуки',
        costPrice: 45000,
        price: 65000,
        stock: 5,
        dimensions: { weight: 2.1, length: 35, width: 23, height: 2 }
      },
      {
        integrationId: ozonIntegrationId,
        sku: 'OZ-002',
        title: 'Мышь Logitech MX Master 3',
        category: 'Периферия',
        costPrice: 3500,
        price: 5500,
        stock: 12,
        dimensions: { weight: 0.14, length: 12, width: 8, height: 5 }
      },
      // Yandex Market продукты
      {
        integrationId: ymIntegrationId,
        sku: 'YM-001',
        title: 'Планшет iPad Air 5',
        category: 'Планшеты',
        costPrice: 55000,
        price: 75000,
        stock: 3,
        dimensions: { weight: 0.46, length: 25, width: 17, height: 0.6 }
      },
      {
        integrationId: ymIntegrationId,
        sku: 'YM-002',
        title: 'Клавиатура Apple Magic Keyboard',
        category: 'Аксессуары',
        costPrice: 8000,
        price: 12000,
        stock: 7,
        dimensions: { weight: 0.23, length: 28, width: 11, height: 1 }
      }
    ];

    for (const product of products) {
      await this.prisma.product.create({ data: product });
    }
  }

  private async createSales(wbIntegrationId: string, ozonIntegrationId: string, ymIntegrationId: string) {
    const products = await this.prisma.product.findMany();
    const sales = [];

    // Генерируем продажи за последние 30 дней
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      
      for (const product of products) {
        // Случайные продажи
        if (Math.random() > 0.3) {
          const qty = Math.floor(Math.random() * 5) + 1;
          const revenue = qty * Number(product.price);
          
          sales.push({
            integrationId: product.integrationId,
            productId: product.id,
            date,
            qty,
            revenue,
            refundQty: Math.random() > 0.9 ? 1 : 0,
            refundAmount: Math.random() > 0.9 ? Number(product.price) : 0
          });
        }
      }
    }

    for (const sale of sales) {
      await this.prisma.sale.create({ data: sale });
    }
  }

  private async createFees(wbIntegrationId: string, ozonIntegrationId: string, ymIntegrationId: string) {
    const products = await this.prisma.product.findMany();
    const fees = [];

    // Генерируем комиссии за последние 30 дней
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      
      for (const product of products) {
        // Комиссии маркетплейса (5-15%)
        const commissionRate = 0.05 + Math.random() * 0.1;
        const commissionAmount = Number(product.price) * commissionRate;
        
        fees.push({
          integrationId: product.integrationId,
          productId: product.id,
          date,
          type: FeeType.COMMISSION,
          amount: commissionAmount,
          meta: { rate: commissionRate, description: 'Комиссия маркетплейса' }
        });

        // Складские расходы (если есть остатки)
        if (product.stock > 0 && Math.random() > 0.7) {
          fees.push({
            integrationId: product.integrationId,
            productId: product.id,
            date,
            type: FeeType.STORAGE,
            amount: 50 + Math.random() * 100,
            meta: { description: 'Складское хранение' }
          });
        }

        // Логистические расходы
        if (Math.random() > 0.6) {
          fees.push({
            integrationId: product.integrationId,
            productId: product.id,
            date,
            type: FeeType.LOGISTICS,
            amount: 100 + Math.random() * 200,
            meta: { description: 'Доставка до покупателя' }
          });
        }

        // Штрафы (редко)
        if (Math.random() > 0.95) {
          fees.push({
            integrationId: product.integrationId,
            productId: product.id,
            date,
            type: FeeType.PENALTY,
            amount: 500 + Math.random() * 1000,
            meta: { description: 'Штраф за нарушение правил' }
          });
        }
      }
    }

    for (const fee of fees) {
      await this.prisma.fee.create({ data: fee });
    }
  }

  private async createAdsStats(wbIntegrationId: string, ozonIntegrationId: string, ymIntegrationId: string) {
    const products = await this.prisma.product.findMany();
    const adsStats = [];

    // Генерируем рекламную статистику за последние 30 дней
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      
      for (const product of products) {
        if (Math.random() > 0.4) { // 60% товаров рекламируются
          const impressions = Math.floor(Math.random() * 2000) + 500;
          const clicks = Math.floor(Math.random() * 200) + 20;
          const spend = Math.floor(Math.random() * 3000) + 500;
          const orders = Math.floor(Math.random() * 5) + 1;
          const revenue = orders * Number(product.price);

          adsStats.push({
            integrationId: product.integrationId,
            productId: product.id,
            date,
            platform: product.integrationId === wbIntegrationId ? 'WB' : 
                      product.integrationId === ozonIntegrationId ? 'Ozon' : 'YaMarket',
            campaign: `${product.title} Campaign`,
            impressions,
            clicks,
            spend,
            orders,
            revenue
          });
        }
      }
    }

    for (const ad of adsStats) {
      await this.prisma.adsStats.create({ data: ad });
    }
  }

  private async createSeoSnapshots(wbIntegrationId: string, ozonIntegrationId: string, ymIntegrationId: string) {
    const products = await this.prisma.product.findMany();
    const seoSnapshots = [];

    const queries = [
      'смартфон samsung', 'galaxy a54', 'наушники airpods', 'airpods pro',
      'ноутбук asus', 'vivoBook 15', 'мышь logitech', 'mx master 3',
      'планшет ipad', 'ipad air 5', 'клавиатура apple', 'magic keyboard'
    ];

    // Генерируем SEO снимки за последние 30 дней
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      
      for (const product of products) {
        for (const query of queries) {
          if (Math.random() > 0.5) {
            seoSnapshots.push({
              integrationId: product.integrationId,
              productId: product.id,
              date,
              position: Math.floor(Math.random() * 30) + 1,
              query,
              conversion: Math.random() * 0.1 + 0.02,
              ctr: Math.random() * 0.05 + 0.01
            });
          }
        }
      }
    }

    for (const snapshot of seoSnapshots) {
      await this.prisma.seoSnapshot.create({ data: snapshot });
    }
  }

  private async createAlerts(wbIntegrationId: string, ozonIntegrationId: string, ymIntegrationId: string) {
    const products = await this.prisma.product.findMany();
    const alerts = [];

    // Создаем различные типы уведомлений
    for (const product of products) {
      // Замороженные товары
      if (product.stock > 0 && Math.random() > 0.7) {
        alerts.push({
          integrationId: product.integrationId,
          productId: product.id,
          type: AlertType.DEAD_STOCK,
          severity: AlertSeverity.MEDIUM,
          message: `Товар ${product.title} не продается более 60 дней при наличии остатков`,
          date: new Date(),
          meta: { stock: product.stock, sku: product.sku }
        });
      }

      // Низкий ROAS
      if (Math.random() > 0.8) {
        alerts.push({
          integrationId: product.integrationId,
          productId: product.id,
          type: AlertType.LOW_ROAS,
          severity: AlertSeverity.HIGH,
          message: `ROAS товара ${product.title} ниже порогового значения`,
          date: new Date(),
          meta: { roas: 2.1, threshold: 3.0, sku: product.sku }
        });
      }

      // Высокие складские расходы
      if (Math.random() > 0.9) {
        alerts.push({
          integrationId: product.integrationId,
          productId: product.id,
          type: AlertType.HIGH_STORAGE_COST,
          severity: AlertSeverity.MEDIUM,
          message: `Высокие складские расходы для товара ${product.title}`,
          date: new Date(),
          meta: { storageCost: 1500, sku: product.sku }
        });
      }
    }

    // Конфликты кампаний
    alerts.push({
      integrationId: wbIntegrationId,
      type: AlertType.CAMPAIGN_CONFLICT,
      severity: AlertSeverity.LOW,
      message: 'Обнаружены пересекающиеся ключевые слова в рекламных кампаниях',
      date: new Date(),
      meta: { 
        conflictingKeywords: ['смартфон', 'samsung'],
        campaigns: ['Samsung Galaxy A54', 'Смартфоны Samsung']
      }
    });

    // Падение SEO позиций
    alerts.push({
      integrationId: ozonIntegrationId,
      productId: products.find(p => p.integrationId === ozonIntegrationId)?.id,
      type: AlertType.SEO_DROP,
      severity: AlertSeverity.MEDIUM,
      message: 'Падение позиции в поиске для товара',
      date: new Date(),
      meta: {
        query: 'ноутбук asus',
        oldPosition: 5,
        newPosition: 15,
        drop: 10
      }
    });

    for (const alert of alerts) {
      await this.prisma.alert.create({ data: alert });
    }
  }

  private async createCalendarEvents(userId: string) {
    const events = [
      {
        userId,
        title: 'WB Поставка #12345',
        type: 'supply' as const,
        startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 часа
        warehouse: 'Склад WB Москва',
        assignee: 'Менеджер по поставкам'
      },
      {
        userId,
        title: 'Ozon Поставка #67890',
        type: 'supply' as const,
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 часа
        warehouse: 'Склад Ozon СПб',
        assignee: 'Менеджер по поставкам'
      }
    ];

    for (const event of events) {
      await this.prisma.calendarEvent.create({ data: event });
    }
  }

  private async createTelegramUser(userId: string) {
    return await this.prisma.telegramUser.create({
      data: {
        userId,
        telegramId: '123456789', // Демо Telegram ID
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        isActive: true
      }
    });
  }
}

// Запуск скрипта
if (require.main === module) {
  const seeder = new DemoDataSeeder();
  seeder.seed()
    .then(() => {
      console.log('Demo data seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Demo data seeding failed:', error);
      process.exit(1);
    });
}
