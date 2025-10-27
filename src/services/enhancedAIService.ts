// src/services/enhancedAIService.ts
import { supabase } from '../lib/supabase';
import { Marketplace } from '../types';

export interface AIRecommendation {
  id: string;
  type: 'pricing' | 'inventory' | 'marketing' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  estimatedValue: number;
  actionRequired: string;
  marketplace: Marketplace;
  createdAt: string;
}

export interface AIPrediction {
  id: string;
  type: 'sales' | 'demand' | 'price' | 'competition';
  productId: string;
  marketplace: Marketplace;
  prediction: {
    value: number;
    confidence: number;
    timeframe: string; // '1d', '7d', '30d', '90d'
  };
  factors: string[];
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    page: string;
    data?: any;
  };
}

class EnhancedAIService {
  private recommendations: AIRecommendation[] = [];
  private predictions: AIPrediction[] = [];
  private chatHistory: AIChatMessage[] = [];

  constructor() {
    this.loadData();
  }

  private async loadData() {
    try {
      // Загружаем рекомендации из Supabase
      const { data: recs } = await supabase
        .from('ai_recommendations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (recs) {
        this.recommendations = recs;
      }

      // Загружаем предсказания
      const { data: preds } = await supabase
        .from('ai_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (preds) {
        this.predictions = preds;
      }
    } catch (error) {
      console.warn('Failed to load AI data:', error);
      this.generateMockData();
    }
  }

  private generateMockData() {
    // Генерируем моковые данные для демонстрации
    this.recommendations = [
      {
        id: '1',
        type: 'pricing',
        title: 'Оптимизация цены на iPhone 15',
        description: 'Рекомендуется снизить цену на 5% для увеличения конкурентоспособности',
        impact: 'high',
        confidence: 87,
        estimatedValue: 15000,
        actionRequired: 'Снизить цену с 89,990 до 85,490 рублей',
        marketplace: 'wildberries',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'inventory',
        title: 'Пополнение запасов AirPods',
        description: 'Критически низкий остаток, рекомендуется срочное пополнение',
        impact: 'high',
        confidence: 95,
        estimatedValue: 25000,
        actionRequired: 'Заказать 50 единиц AirPods Pro',
        marketplace: 'ozon',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        type: 'marketing',
        title: 'Запуск рекламной кампании',
        description: 'Оптимальное время для запуска кампании по продвижению новых товаров',
        impact: 'medium',
        confidence: 72,
        estimatedValue: 8000,
        actionRequired: 'Настроить рекламу на 7 дней с бюджетом 10,000 руб',
        marketplace: 'ym',
        createdAt: new Date().toISOString(),
      },
    ];

    this.predictions = [
      {
        id: '1',
        type: 'sales',
        productId: 'iphone-15',
        marketplace: 'wildberries',
        prediction: {
          value: 45,
          confidence: 82,
          timeframe: '7d',
        },
        factors: ['Сезонность', 'Конкуренты', 'Ценовая политика'],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'demand',
        productId: 'airpods-pro',
        marketplace: 'ozon',
        prediction: {
          value: 120,
          confidence: 78,
          timeframe: '30d',
        },
        factors: ['Тренды', 'Праздники', 'Погода'],
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // Получение рекомендаций
  async getRecommendations(filters?: {
    type?: string;
    marketplace?: Marketplace;
    impact?: string;
  }): Promise<AIRecommendation[]> {
    let filtered = [...this.recommendations];

    if (filters?.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    if (filters?.marketplace) {
      filtered = filtered.filter(r => r.marketplace === filters.marketplace);
    }
    if (filters?.impact) {
      filtered = filtered.filter(r => r.impact === filters.impact);
    }

    return filtered.sort((a, b) => b.confidence - a.confidence);
  }

  // Получение предсказаний
  async getPredictions(filters?: {
    type?: string;
    marketplace?: Marketplace;
    timeframe?: string;
  }): Promise<AIPrediction[]> {
    let filtered = [...this.predictions];

    if (filters?.type) {
      filtered = filtered.filter(p => p.type === filters.type);
    }
    if (filters?.marketplace) {
      filtered = filtered.filter(p => p.marketplace === filters.marketplace);
    }
    if (filters?.timeframe) {
      filtered = filtered.filter(p => p.prediction.timeframe === filters.timeframe);
    }

    return filtered.sort((a, b) => b.prediction.confidence - a.prediction.confidence);
  }

  // AI чат
  async sendMessage(message: string, context?: any): Promise<string> {
    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      context,
    };

    this.chatHistory.push(userMessage);

    // Симуляция AI ответа
    const response = await this.generateAIResponse(message, context);
    
    const assistantMessage: AIChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    this.chatHistory.push(assistantMessage);
    return response;
  }

  private async generateAIResponse(message: string, context?: any): Promise<string> {
    // Простая логика для демонстрации
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('цена') || lowerMessage.includes('ценообразование')) {
      return `Анализирую ценообразование... Рекомендую снизить цены на 3-5% для увеличения конкурентоспособности. Это может увеличить продажи на 15-20%.`;
    }

    if (lowerMessage.includes('склад') || lowerMessage.includes('остатки')) {
      return `Проверяю остатки... Обнаружены товары с критически низким остатком. Рекомендую срочно пополнить запасы AirPods Pro и iPhone 15.`;
    }

    if (lowerMessage.includes('реклама') || lowerMessage.includes('маркетинг')) {
      return `Анализирую маркетинговые возможности... Оптимальное время для запуска рекламной кампании. Рекомендую бюджет 10,000-15,000 руб на 7 дней.`;
    }

    if (lowerMessage.includes('прогноз') || lowerMessage.includes('предсказание')) {
      return `Генерирую прогноз... Ожидается рост продаж на 25% в ближайшие 30 дней. Основные факторы: сезонность и новые поступления.`;
    }

    return `Анализирую ваш запрос... На основе данных ваших маркетплейсов могу предложить оптимизацию ценообразования, управление запасами или маркетинговые рекомендации. Что именно вас интересует?`;
  }

  // Получение истории чата
  getChatHistory(): AIChatMessage[] {
    return this.chatHistory;
  }

  // Очистка истории чата
  clearChatHistory() {
    this.chatHistory = [];
  }

  // Создание новой рекомендации
  async createRecommendation(recommendation: Omit<AIRecommendation, 'id' | 'createdAt'>): Promise<AIRecommendation> {
    const newRec: AIRecommendation = {
      ...recommendation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    this.recommendations.unshift(newRec);

    try {
      await supabase
        .from('ai_recommendations')
        .insert(newRec);
    } catch (error) {
      console.warn('Failed to save recommendation:', error);
    }

    return newRec;
  }

  // Обновление статуса рекомендации
  async updateRecommendationStatus(id: string, status: 'pending' | 'applied' | 'dismissed') {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      // В реальном приложении здесь было бы обновление в БД
      console.log(`Recommendation ${id} status updated to ${status}`);
    }
  }
}

export const enhancedAIService = new EnhancedAIService();
