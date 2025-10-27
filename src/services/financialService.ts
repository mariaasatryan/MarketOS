// src/services/financialService.ts
import { supabase } from '../lib/supabase';
import { Marketplace } from '../types';

export interface FinancialTransaction {
  id: string;
  type: 'revenue' | 'expense' | 'cost_of_goods' | 'advertising' | 'logistics' | 'other';
  category: string;
  amount: number;
  description: string;
  marketplace?: Marketplace;
  orderId?: string;
  productId?: string;
  date: string;
  createdAt: string;
  tags?: string[];
}

export interface OperatingProfit {
  period: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMargin: number; // percentage
  operatingExpenses: number;
  operatingProfit: number;
  operatingMargin: number; // percentage
  netProfit: number;
  netMargin: number; // percentage
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  revenueGrowth: number; // percentage vs previous period
  profitGrowth: number; // percentage vs previous period
}

export interface MarketplaceFinancials {
  marketplace: Marketplace;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  orders: number;
  averageOrderValue: number;
}

export interface BudgetItem {
  id: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  period: string;
}

export interface CashFlow {
  period: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

class FinancialService {
  private transactions: FinancialTransaction[] = [];
  private budgets: BudgetItem[] = [];

  constructor() {
    this.loadData();
  }

  private async loadData() {
    try {
      // Загружаем транзакции из Supabase
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(1000);

      if (transactions) {
        this.transactions = transactions;
      }

      // Загружаем бюджеты
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .order('period', { ascending: false });

      if (budgets) {
        this.budgets = budgets;
      }
    } catch (error) {
      console.warn('Failed to load financial data:', error);
      this.generateMockData();
    }
  }

  private generateMockData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Генерируем транзакции за последние 6 месяцев
    this.transactions = [];
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const month = currentMonth - monthOffset;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const actualMonth = month < 0 ? month + 12 : month;

      // Доходы (продажи)
      for (let i = 0; i < 20; i++) {
        this.transactions.push({
          id: `rev-${monthOffset}-${i}`,
          type: 'revenue',
          category: 'Продажи',
          amount: Math.random() * 50000 + 10000,
          description: `Продажа товара #${1000 + i}`,
          marketplace: ['wildberries', 'ozon', 'ym', 'smm'][Math.floor(Math.random() * 4)] as Marketplace,
          orderId: `ORD-${year}-${actualMonth}-${i}`,
          date: new Date(year, actualMonth, Math.floor(Math.random() * 28) + 1).toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['sales', 'revenue'],
        });
      }

      // Себестоимость
      for (let i = 0; i < 15; i++) {
        this.transactions.push({
          id: `cogs-${monthOffset}-${i}`,
          type: 'cost_of_goods',
          category: 'Себестоимость товаров',
          amount: Math.random() * 30000 + 5000,
          description: `Закупка товара #${2000 + i}`,
          date: new Date(year, actualMonth, Math.floor(Math.random() * 28) + 1).toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['cogs', 'purchase'],
        });
      }

      // Реклама
      for (let i = 0; i < 8; i++) {
        this.transactions.push({
          id: `adv-${monthOffset}-${i}`,
          type: 'advertising',
          category: 'Реклама',
          amount: Math.random() * 20000 + 2000,
          description: `Рекламная кампания #${3000 + i}`,
          marketplace: ['wildberries', 'ozon', 'ym'][Math.floor(Math.random() * 3)] as Marketplace,
          date: new Date(year, actualMonth, Math.floor(Math.random() * 28) + 1).toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['advertising', 'marketing'],
        });
      }

      // Логистика
      for (let i = 0; i < 12; i++) {
        this.transactions.push({
          id: `log-${monthOffset}-${i}`,
          type: 'logistics',
          category: 'Логистика',
          amount: Math.random() * 5000 + 1000,
          description: `Доставка заказа #${4000 + i}`,
          date: new Date(year, actualMonth, Math.floor(Math.random() * 28) + 1).toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['logistics', 'shipping'],
        });
      }

      // Прочие расходы
      for (let i = 0; i < 5; i++) {
        this.transactions.push({
          id: `oth-${monthOffset}-${i}`,
          type: 'other',
          category: 'Прочие расходы',
          amount: Math.random() * 10000 + 1000,
          description: `Прочий расход #${5000 + i}`,
          date: new Date(year, actualMonth, Math.floor(Math.random() * 28) + 1).toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['other', 'expense'],
        });
      }
    }

    // Генерируем бюджеты
    this.budgets = [
      {
        id: '1',
        category: 'Реклама',
        budgetedAmount: 150000,
        actualAmount: 142000,
        variance: -8000,
        variancePercentage: -5.3,
        period: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      },
      {
        id: '2',
        category: 'Логистика',
        budgetedAmount: 80000,
        actualAmount: 85000,
        variance: 5000,
        variancePercentage: 6.25,
        period: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      },
      {
        id: '3',
        category: 'Себестоимость',
        budgetedAmount: 500000,
        actualAmount: 480000,
        variance: -20000,
        variancePercentage: -4.0,
        period: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      },
    ];
  }

  // Получение транзакций
  async getTransactions(filters?: {
    type?: string;
    marketplace?: Marketplace;
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<FinancialTransaction[]> {
    let filtered = [...this.transactions];

    if (filters?.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters?.marketplace) {
      filtered = filtered.filter(t => t.marketplace === filters.marketplace);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate!);
    }
    if (filters?.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Расчет операционной прибыли
  async calculateOperatingProfit(period: string): Promise<OperatingProfit> {
    const startDate = new Date(period + '-01');
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const periodTransactions = this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const revenue = periodTransactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);

    const costOfGoodsSold = periodTransactions
      .filter(t => t.type === 'cost_of_goods')
      .reduce((sum, t) => sum + t.amount, 0);

    const operatingExpenses = periodTransactions
      .filter(t => ['advertising', 'logistics', 'other'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = revenue - costOfGoodsSold;
    const operatingProfit = grossProfit - operatingExpenses;
    const netProfit = operatingProfit; // В упрощенной модели

    return {
      period,
      revenue,
      costOfGoodsSold,
      grossProfit,
      grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      operatingExpenses,
      operatingProfit,
      operatingMargin: revenue > 0 ? (operatingProfit / revenue) * 100 : 0,
      netProfit,
      netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    };
  }

  // Получение финансовых метрик
  async getFinancialMetrics(period: string): Promise<FinancialMetrics> {
    const operatingProfit = await this.calculateOperatingProfit(period);
    
    // Получаем данные за предыдущий период для расчета роста
    const prevPeriod = new Date(period + '-01');
    prevPeriod.setMonth(prevPeriod.getMonth() - 1);
    const prevPeriodStr = `${prevPeriod.getFullYear()}-${String(prevPeriod.getMonth() + 1).padStart(2, '0')}`;
    const prevOperatingProfit = await this.calculateOperatingProfit(prevPeriodStr);

    const revenueGrowth = prevOperatingProfit.revenue > 0 
      ? ((operatingProfit.revenue - prevOperatingProfit.revenue) / prevOperatingProfit.revenue) * 100 
      : 0;

    const profitGrowth = prevOperatingProfit.operatingProfit > 0 
      ? ((operatingProfit.operatingProfit - prevOperatingProfit.operatingProfit) / prevOperatingProfit.operatingProfit) * 100 
      : 0;

    return {
      totalRevenue: operatingProfit.revenue,
      totalExpenses: operatingProfit.costOfGoodsSold + operatingProfit.operatingExpenses,
      grossProfit: operatingProfit.grossProfit,
      operatingProfit: operatingProfit.operatingProfit,
      netProfit: operatingProfit.netProfit,
      grossMargin: operatingProfit.grossMargin,
      operatingMargin: operatingProfit.operatingMargin,
      netMargin: operatingProfit.netMargin,
      revenueGrowth,
      profitGrowth,
    };
  }

  // Финансы по маркетплейсам
  async getMarketplaceFinancials(period: string): Promise<MarketplaceFinancials[]> {
    const startDate = new Date(period + '-01');
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const periodTransactions = this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const marketplaces: Marketplace[] = ['wildberries', 'ozon', 'ym', 'smm'];
    
    return marketplaces.map(marketplace => {
      const marketplaceTransactions = periodTransactions.filter(t => t.marketplace === marketplace);
      
      const revenue = marketplaceTransactions
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = marketplaceTransactions
        .filter(t => ['advertising', 'logistics', 'other'].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0);

      const orders = marketplaceTransactions
        .filter(t => t.type === 'revenue')
        .length;

      const profit = revenue - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const averageOrderValue = orders > 0 ? revenue / orders : 0;

      return {
        marketplace,
        revenue,
        expenses,
        profit,
        margin,
        orders,
        averageOrderValue,
      };
    }).filter(m => m.revenue > 0); // Только маркетплейсы с доходами
  }

  // Получение бюджета
  async getBudgets(period?: string): Promise<BudgetItem[]> {
    let filtered = [...this.budgets];

    if (period) {
      filtered = filtered.filter(b => b.period === period);
    }

    return filtered;
  }

  // Создание транзакции
  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>): Promise<FinancialTransaction> {
    const newTransaction: FinancialTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    this.transactions.unshift(newTransaction);

    try {
      await supabase
        .from('financial_transactions')
        .insert(newTransaction);
    } catch (error) {
      console.warn('Failed to save transaction:', error);
    }

    return newTransaction;
  }

  // Получение денежного потока
  async getCashFlow(period: string): Promise<CashFlow> {
    const operatingProfit = await this.calculateOperatingProfit(period);
    
    // Упрощенная модель денежного потока
    const operatingCashFlow = operatingProfit.operatingProfit;
    const investingCashFlow = 0; // В упрощенной модели
    const financingCashFlow = 0; // В упрощенной модели
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    return {
      period,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      beginningCash: 100000, // Начальный остаток
      endingCash: 100000 + netCashFlow,
    };
  }

  // Экспорт данных
  async exportFinancialData(period: string, format: 'csv' | 'excel' = 'csv'): Promise<string> {
    const transactions = await this.getTransactions({
      startDate: period + '-01',
      endDate: period + '-31',
    });

    if (format === 'csv') {
      const headers = ['Дата', 'Тип', 'Категория', 'Сумма', 'Описание', 'Маркетплейс', 'Теги'];
      const rows = transactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.amount.toString(),
        t.description,
        t.marketplace || '',
        t.tags?.join(', ') || '',
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(transactions, null, 2);
  }
}

export const financialService = new FinancialService();
