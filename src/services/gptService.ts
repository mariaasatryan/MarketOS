import { Marketplace } from '../types';
import { marketplaceKnowledgeService } from './marketplaceKnowledge';

export interface GPTMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GPTResponse {
  message: string;
  sources?: string[];
  confidence?: number;
}

export interface MarketplaceContext {
  marketplaces: Marketplace[];
  userData?: {
    totalProducts?: number;
    totalOrders?: number;
    totalRevenue?: number;
  };
}

class GPTService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    // В реальном приложении API ключ должен быть в переменных окружения
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || null;
  }

  /**
   * Генерирует контекстную подсказку на основе выбранных маркетплейсов
   */
  private generateSystemPrompt(context: MarketplaceContext): string {
    const marketplaceNames = context.marketplaces.map(mp => {
      switch (mp) {
        case 'wildberries': return 'Wildberries';
        case 'ozon': return 'Ozon';
        case 'ym': return 'Яндекс.Маркет';
        default: return mp;
      }
    }).join(', ');

    return `Ты - MarketOS GPT, эксперт по российским маркетплейсам. Твоя специализация: ${marketplaceNames}.

Ты помогаешь селлерам с:
- Оптимизацией карточек товаров
- Стратегиями продвижения и рекламы
- Анализом конкурентов и рынка
- Логистикой и складскими остатками
- Работой с отзывами и рейтингами
- Комиссиями и тарифами
- SEO и поисковой оптимизацией
- Аналитикой продаж

Всегда давай конкретные, практические советы с примерами.
Используй актуальную информацию о российском рынке маркетплейсов.
Отвечай на русском языке, будь дружелюбным и профессиональным.`;
  }

  /**
   * Обогащает пользовательский запрос контекстом маркетплейсов
   */
  private enrichUserQuery(query: string, context: MarketplaceContext): string {
    const marketplaceContext = context.marketplaces.length > 0 
      ? `Контекст: работаю с маркетплейсами ${context.marketplaces.join(', ')}. `
      : '';
    
    return `${marketplaceContext}${query}`;
  }

  /**
   * Отправляет запрос к GPT API
   */
  async askQuestion(
    question: string, 
    context: MarketplaceContext,
    conversationHistory: GPTMessage[] = []
  ): Promise<GPTResponse> {
    if (!this.apiKey) {
      // Fallback к локальной логике, если API ключ не настроен
      return this.getLocalResponse(question, context);
    }

    try {
      const systemPrompt = this.generateSystemPrompt(context);
      const enrichedQuery = this.enrichUserQuery(question, context);

      const messages: GPTMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: enrichedQuery }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`GPT API error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';

      return {
        message,
        confidence: 0.9,
        sources: ['MarketOS Knowledge Base', 'OpenAI GPT-4']
      };

    } catch (error) {
      console.error('GPT API Error:', error);
      // Fallback к локальной логике
      return this.getLocalResponse(question, context);
    }
  }

  /**
   * Локальные ответы для демонстрации (когда API недоступен)
   */
  private getLocalResponse(question: string, context: MarketplaceContext): GPTResponse {
    const lowerQuestion = question.toLowerCase();
    const marketplaceNames = context.marketplaces.map(mp => {
      switch (mp) {
        case 'wildberries': return 'Wildberries';
        case 'ozon': return 'Ozon';
        case 'ym': return 'Яндекс.Маркет';
        default: return mp;
      }
    }).join(', ');

    // Используем базу знаний для более точных ответов
    if (lowerQuestion.includes('комиссия') || lowerQuestion.includes('комиссии')) {
      const commissionInfo = marketplaceKnowledgeService.getCommissionInfo(context.marketplaces);
      return {
        message: `Комиссии на ${marketplaceNames}:\n\n${commissionInfo}\n\n💡 Совет: Оптимизируйте категории товаров для снижения комиссий.`,
        sources: ['База знаний MarketOS', 'Документация маркетплейсов'],
        confidence: 0.9
      };
    }
    
    if (lowerQuestion.includes('реклама') || lowerQuestion.includes('продвижение')) {
      const advertisingTips = marketplaceKnowledgeService.getAdvertisingTips(context.marketplaces);
      return {
        message: `Стратегии продвижения на ${marketplaceNames}:\n\n${advertisingTips.map(tip => `• ${tip}`).join('\n')}\n\n💰 Рекомендуемый бюджет: 10-15% от оборота на рекламу.`,
        sources: ['База знаний MarketOS', 'Руководство по рекламе'],
        confidence: 0.85
      };
    }
    
    if (lowerQuestion.includes('логистика') || lowerQuestion.includes('доставка')) {
      const logisticsTips = marketplaceKnowledgeService.getLogisticsTips(context.marketplaces);
      return {
        message: `Логистические решения для ${marketplaceNames}:\n\n${logisticsTips.map(tip => `• ${tip}`).join('\n')}\n\n🚚 Рекомендация: Начните с FBO для быстрого старта продаж.`,
        sources: ['База знаний MarketOS', 'Логистические партнеры'],
        confidence: 0.9
      };
    }

    if (lowerQuestion.includes('карточка') || lowerQuestion.includes('описание') || lowerQuestion.includes('оптимизация')) {
      const optimizationTips = marketplaceKnowledgeService.getOptimizationTips(context.marketplaces);
      return {
        message: `Оптимизация для ${marketplaceNames}:\n\n${optimizationTips.map(tip => `• ${tip}`).join('\n')}\n\n📈 Это увеличит конверсию на 20-30%.`,
        sources: ['База знаний MarketOS', 'SEO-руководство'],
        confidence: 0.8
      };
    }

    if (lowerQuestion.includes('отзыв') || lowerQuestion.includes('рейтинг')) {
      const reviewTips = marketplaceKnowledgeService.getOptimizationTips(context.marketplaces)
        .filter(tip => tip.toLowerCase().includes('отзыв') || tip.toLowerCase().includes('рейтинг'));
      return {
        message: `Работа с отзывами на ${marketplaceNames}:\n\n${reviewTips.map(tip => `• ${tip}`).join('\n')}\n\n⭐ Цель: рейтинг выше 4.5 звезд.`,
        sources: ['База знаний MarketOS', 'Лучшие практики'],
        confidence: 0.85
      };
    }

    // Поиск в базе знаний
    const searchResults = marketplaceKnowledgeService.searchKnowledge(question, context.marketplaces);
    if (searchResults.length > 0) {
      return {
        message: `Найдена информация по вашему запросу:\n\n${searchResults.map(result => `• ${result}`).join('\n')}\n\nНужна более детальная консультация?`,
        sources: ['База знаний MarketOS'],
        confidence: 0.8
      };
    }

    // Общий ответ с рекомендациями
    const optimizationTips = marketplaceKnowledgeService.getOptimizationTips(context.marketplaces);
    return {
      message: `Отличный вопрос! Для работы с ${marketplaceNames} рекомендую:\n\n${optimizationTips.slice(0, 5).map(tip => `• ${tip}`).join('\n')}\n\nНужна более детальная консультация по конкретному вопросу?`,
      sources: ['База знаний MarketOS', 'Экспертные материалы'],
      confidence: 0.7
    };
  }

  /**
   * Получает рекомендации по оптимизации
   */
  async getOptimizationTips(marketplace: Marketplace): Promise<string[]> {
    const tips: Record<Marketplace, string[]> = {
      wildberries: [
        'Используйте WB Boost для продвижения товаров',
        'Оптимизируйте карточки под поисковые запросы',
        'Работайте с отзывами и рейтингами',
        'Анализируйте конкурентов через WB Analytics'
      ],
      ozon: [
        'Подключите Ozon Premium для дополнительных возможностей',
        'Используйте баннерную рекламу в каталоге',
        'Настройте автоматические скидки',
        'Работайте с рекомендательной системой'
      ],
      ym: [
        'Настройте Яндекс.Директ для привлечения трафика',
        'Оптимизируйте под поисковые запросы Яндекса',
        'Используйте Яндекс.Метрику для аналитики',
        'Работайте с рекомендациями товаров'
      ],
      smm: []
    };

    return tips[marketplace] || [];
  }
}

export const gptService = new GPTService();
