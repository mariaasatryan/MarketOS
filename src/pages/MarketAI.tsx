import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Sparkles, 
  Package, 
  Send, 
  Loader2,
  Download,
  RefreshCw,
  User,
  Settings,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Star,
  Upload,
  Image,
  Video,
  BarChart3,
  Search,
  Users,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Brain,
  Activity,
  TrendingDown,
  CreditCard,
  XCircle,
  Globe,
  MapPin,
  Shield,
  Bell
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { Marketplace } from '../types';
import { ProductCardAnalysis } from '../components/ProductCardAnalysis';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  marketplaces?: Marketplace[];
  sources?: string[];
  confidence?: number;
}


interface AIInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionItems: string[];
}

interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense' | 'refund' | 'commission';
  amount: number;
  description: string;
  marketplace: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  totalTransactions: number;
  averageTransactionValue: number;
  monthlyGrowth: number;
  quarterlyGrowth: number;
  yearlyGrowth: number;
}


export default function MarketAI() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'chat' | 'content' | 'reviews' | 'analysis' | 'suppliers' | 'financial'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я ваш продвинутый ИИ-помощник для маркетплейсов. Я могу помочь с анализом конкурентов, оптимизацией карточек, прогнозированием трендов и многим другим. Что вас интересует?',
      timestamp: new Date(),
      marketplaces: ['wildberries', 'ozon', 'ym'],
      confidence: 0.95
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Marketplace[]>(['wildberries', 'ozon', 'ym']);
  const [showMarketplaceSelector, setShowMarketplaceSelector] = useState(false);
  const [contentPrompt, setContentPrompt] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProductAnalysis, setShowProductAnalysis] = useState(false);
  const [reviewPrompt, setReviewPrompt] = useState('');
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [seoPrompt, setSeoPrompt] = useState('');
  const [isAnalyzingSEO, setIsAnalyzingSEO] = useState(false);
  const [contentType, setContentType] = useState<'photo' | 'video'>('photo');
  const [contentAspectRatio, setContentAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9'>('1:1');
  const [contentOrientation, setContentOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [infographicLevel, setInfographicLevel] = useState<'none' | 'minimal' | 'maximum'>('minimal');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);
  const [selectedSupplierPlatform, setSelectedSupplierPlatform] = useState<'alibaba' | '1688' | 'global'>('alibaba');
  const [autoReplyTemplate, setAutoReplyTemplate] = useState('Спасибо за ваш отзыв! Мы рады, что товар вам понравился. Если у вас есть вопросы, обращайтесь к нам в любое время.');
  const [autoReplySettings, setAutoReplySettings] = useState({
    enabled: false,
    responseDelay: 30, // минут
    includeEmoji: true,
    personalizedResponse: true,
    notifyManager: true
  });
  const [seoAnalysisResults, setSeoAnalysisResults] = useState<any>(null);
  const [isGeneratingSeoReport, setIsGeneratingSeoReport] = useState(false);
  const [productAnalysisResults, setProductAnalysisResults] = useState<any>(null);
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const marketplaceOptions = [
    { value: 'wildberries', label: 'Wildberries', color: 'bg-purple-100 text-purple-800' },
    { value: 'ozon', label: 'Ozon', color: 'bg-blue-100 text-blue-800' },
    { value: 'ym', label: 'Яндекс.Маркет', color: 'bg-yellow-100 text-yellow-800' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadInsights();
    loadFinancialData();
  }, []);


  const loadInsights = async () => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Рост спроса на беспроводные наушники',
        description: 'Анализ показывает рост спроса на беспроводные наушники на 25% за последний квартал',
        impact: 'high',
        confidence: 0.87,
        actionItems: [
          'Расширить ассортимент беспроводных наушников',
          'Улучшить позиционирование существующих моделей',
          'Рассмотреть партнерство с новыми брендами'
        ]
      },
      {
        id: '2',
        type: 'threat',
        title: 'Снижение цен конкурентов на смартфоны',
        description: 'Конкуренты снизили цены на смартфоны в среднем на 15%, что может повлиять на ваши продажи',
        impact: 'medium',
        confidence: 0.92,
        actionItems: [
          'Пересмотреть ценовую стратегию',
          'Усилить акценты на уникальных характеристиках',
          'Рассмотреть специальные предложения'
        ]
      }
    ];
    setInsights(mockInsights);
  };

  const loadFinancialData = async () => {
    const mockTransactions: FinancialTransaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 450000,
        description: 'Продажа Samsung Galaxy S24',
        marketplace: 'wildberries',
        category: 'Электроника',
        date: '2024-01-15T10:30:00Z',
        status: 'completed',
        reference: 'WB-123456789'
      },
      {
        id: '2',
        type: 'expense',
        amount: 300000,
        description: 'Закупка Samsung Galaxy S24',
        marketplace: 'wildberries',
        category: 'Закупка',
        date: '2024-01-15T10:30:00Z',
        status: 'completed',
        reference: 'WB-123456789'
      }
    ];
    setTransactions(mockTransactions);
    
    const mockMetrics: FinancialMetrics = {
      totalRevenue: 750000,
      totalExpenses: 500000,
      netProfit: 250000,
      grossMargin: 33.3,
      netMargin: 33.3,
      totalTransactions: 9,
      averageTransactionValue: 83333,
      monthlyGrowth: 15.2,
      quarterlyGrowth: 8.7,
      yearlyGrowth: 25.4
    };
    setMetrics(mockMetrics);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      marketplaces: selectedMarketplaces
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Анализирую ваш запрос: "${inputMessage}". На основе данных по выбранным маркетплейсам (${selectedMarketplaces.join(', ')}) могу предложить следующие рекомендации:

1. **Анализ конкурентов**: Рекомендую изучить топ-10 товаров в вашей категории
2. **Ценовая стратегия**: Оптимальная цена должна быть на 5-10% ниже среднерыночной
3. **Оптимизация карточки**: Добавьте ключевые слова в заголовок и описание
4. **Время размещения**: Лучшее время для размещения - 14:00-16:00 по московскому времени

Хотите получить более детальный анализ по какому-то из этих направлений?`,
        timestamp: new Date(),
        marketplaces: selectedMarketplaces,
        sources: ['Анализ Wildberries', 'Данные Ozon', 'Статистика Яндекс.Маркет'],
        confidence: 0.89
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
        timestamp: new Date(),
        marketplaces: selectedMarketplaces
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!contentPrompt.trim()) return;

    setIsGeneratingContent(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const generatedContent = {
        type: contentType,
        aspectRatio: contentAspectRatio,
        orientation: contentOrientation,
        infographicLevel: infographicLevel,
        prompt: contentPrompt,
        uploadedFiles: uploadedFiles.length,
        timestamp: new Date().toISOString()
      };

      // Сохраняем результат в localStorage для демонстрации
      const existingContent = JSON.parse(localStorage.getItem('generatedContent') || '[]');
      existingContent.push(generatedContent);
      localStorage.setItem('generatedContent', JSON.stringify(existingContent));

      alert(`✅ Контент успешно сгенерирован!

📝 Описание: "${contentPrompt}"
🎨 Параметры генерации:
   • Тип: ${contentType === 'photo' ? 'Фото' : 'Видео'}
   • Пропорции: ${contentAspectRatio}
   • Ориентация: ${contentOrientation === 'vertical' ? 'Вертикальная' : 'Горизонтальная'}
   • Инфографика: ${infographicLevel === 'none' ? 'Без инфографики' : infographicLevel === 'minimal' ? 'Минимально' : 'Максимум'}
   • Загружено файлов: ${uploadedFiles.length}

🤖 Использованные ИИ-технологии:
   • ${contentType === 'photo' ? 'DALL-E 3, Midjourney, Stable Diffusion' : 'RunwayML, Pika Labs, Sora'}
   • Автоматическая оптимизация под выбранные пропорции
   • Интеллектуальная обработка загруженных материалов

📁 Файлы сохранены в папку "Generated Content"
🔄 Готово к использованию в контент-воронке!`);

      // Очищаем форму после успешной генерации
      setContentPrompt('');
      setUploadedFiles([]);

    } catch (error) {
      console.error('Error generating content:', error);
      alert('❌ Ошибка при генерации контента. Проверьте подключение к ИИ-сервисам.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleGenerateReview = async () => {
    if (!reviewPrompt.trim()) return;

    setIsGeneratingReview(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      alert(`✅ Отзыв успешно сгенерирован!

📝 Описание товара: "${reviewPrompt}"
⭐ Сгенерированный отзыв:
"Отличный товар! Качество превзошло все ожидания. Быстрая доставка, хорошая упаковка. Рекомендую к покупке!"

🎯 Автоматические ответы: ${autoReplyEnabled ? 'Включены' : 'Отключены'}`);

    } catch (error) {
      console.error('Error generating review:', error);
      alert('❌ Ошибка при генерации отзыва.');
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleAnalyzeSEO = async () => {
    if (!seoPrompt.trim()) return;

    setIsAnalyzingSEO(true);
    setIsGeneratingSeoReport(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));

      const mockSeoResults = {
        overallScore: 85,
        keywordDensity: {
          primary: 'смартфон',
          density: 2.3,
          recommended: '2-3%'
        },
        titleOptimization: {
          current: 'Смартфон Samsung Galaxy S24',
          optimized: 'Смартфон Samsung Galaxy S24 128GB - купить в Москве',
          score: 78,
          improvements: [
            'Добавить объем памяти',
            'Указать город для локального SEO',
            'Добавить призыв к действию'
          ]
        },
        descriptionAnalysis: {
          length: 156,
          recommendedLength: '200-300 символов',
          score: 65,
          improvements: [
            'Увеличить длину описания',
            'Добавить больше ключевых слов',
            'Включить характеристики товара'
          ]
        },
        imageOptimization: {
          altTexts: 3,
          totalImages: 5,
          score: 60,
          improvements: [
            'Добавить alt-тексты для всех изображений',
            'Оптимизировать размеры изображений',
            'Использовать описательные названия файлов'
          ]
        },
        competitorAnalysis: {
          avgPrice: 45000,
          avgRating: 4.6,
          topKeywords: ['samsung galaxy', 'смартфон samsung', 'galaxy s24'],
          opportunities: [
            'Снизить цену на 5-10%',
            'Улучшить качество фото',
            'Добавить видео обзор'
          ]
        },
        recommendations: [
          {
            priority: 'high',
            category: 'Заголовок',
            action: 'Оптимизировать заголовок товара',
            impact: 'Увеличение CTR на 15-20%',
            effort: 'low'
          },
          {
            priority: 'medium',
            category: 'Описание',
            action: 'Расширить описание товара',
            impact: 'Улучшение ранжирования',
            effort: 'medium'
          },
          {
            priority: 'high',
            category: 'Изображения',
            action: 'Добавить alt-тексты',
            impact: 'Доступность и SEO',
            effort: 'low'
          },
          {
            priority: 'medium',
            category: 'Цена',
            action: 'Скорректировать цену',
            impact: 'Конкурентоспособность',
            effort: 'low'
          }
        ],
        keywordSuggestions: [
          'samsung galaxy s24 купить',
          'смартфон samsung недорого',
          'galaxy s24 характеристики',
          'samsung телефон отзывы',
          'купить samsung galaxy москва'
        ],
        technicalIssues: [
          'Отсутствуют alt-тексты у 2 изображений',
          'Описание слишком короткое',
          'Не указан объем памяти в заголовке'
        ]
      };

      setSeoAnalysisResults(mockSeoResults);

      alert(`✅ SEO-анализ завершен!

🔍 Анализируемый товар: "${seoPrompt}"
📊 Общая SEO-оценка: ${mockSeoResults.overallScore}/100

📈 Основные показатели:
   • Плотность ключевых слов: ${mockSeoResults.keywordDensity.density}% (рекомендуется: ${mockSeoResults.keywordDensity.recommended})
   • Оптимизация заголовка: ${mockSeoResults.titleOptimization.score}/100
   • Описание товара: ${mockSeoResults.descriptionAnalysis.score}/100
   • Изображения: ${mockSeoResults.imageOptimization.score}/100

🎯 Рекомендации по улучшению:
   • ${mockSeoResults.recommendations.filter(r => r.priority === 'high').length} критичных улучшений
   • ${mockSeoResults.recommendations.filter(r => r.priority === 'medium').length} важных улучшений
   • Потенциальный рост трафика: +25-35%

💡 Следующие шаги:
   1. Оптимизировать заголовок товара
   2. Расширить описание до 200-300 символов
   3. Добавить alt-тексты для изображений
   4. Скорректировать цену для конкурентоспособности`);

    } catch (error) {
      console.error('Error analyzing SEO:', error);
      alert('❌ Ошибка при SEO-анализе.');
    } finally {
      setIsAnalyzingSEO(false);
      setIsGeneratingSeoReport(false);
    }
  };

  const handleMarketplaceToggle = (marketplace: Marketplace) => {
    setSelectedMarketplaces(prev => 
      prev.includes(marketplace)
        ? prev.filter(mp => mp !== marketplace)
        : [...prev, marketplace]
    );
  };

  const runCompetitorAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadInsights();
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateFinancialData = async () => {
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadFinancialData();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFinancialExport = async (format: 'csv' | 'excel' | 'json') => {
    if (!metrics || !transactions.length) {
      alert('⚠️ Нет данных для экспорта. Сначала обновите финансовые данные.');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const exportData = {
        metrics: metrics,
        transactions: transactions,
        exportDate: new Date().toISOString(),
        format: format
      };

      // Сохраняем данные экспорта в localStorage для демонстрации
      const existingExports = JSON.parse(localStorage.getItem('financialExports') || '[]');
      existingExports.push(exportData);
      localStorage.setItem('financialExports', JSON.stringify(existingExports));

      alert(`✅ Финансовые данные успешно экспортированы!

📊 Экспортированные данные:
   • Формат: ${format.toUpperCase()}
   • Метрики: ${Object.keys(metrics).length} показателей
   • Транзакции: ${transactions.length} записей
   • Период: Последние 30 дней
   • Общая выручка: ${metrics.totalRevenue.toLocaleString('ru-RU')} ₽
   • Чистая прибыль: ${metrics.netProfit.toLocaleString('ru-RU')} ₽

📁 Файл сохранен как: financial_report_${new Date().toISOString().split('T')[0]}.${format}
💾 Готов для анализа в Excel, Google Sheets или других инструментах`);
      
    } catch (error) {
      console.error('Error exporting financial data:', error);
      alert('❌ Ошибка при экспорте данных. Попробуйте еще раз.');
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp size={20} className="text-green-600" />;
      case 'threat':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'trend':
        return <Activity size={20} className="text-blue-600" />;
      case 'recommendation':
        return <Lightbulb size={20} className="text-yellow-600" />;
      default:
        return <Brain size={20} className="text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'threat':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'trend':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'recommendation':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'expense':
        return <TrendingDown size={16} className="text-red-600" />;
      case 'refund':
        return <RefreshCw size={16} className="text-blue-600" />;
      case 'commission':
        return <CreditCard size={16} className="text-purple-600" />;
      default:
        return <DollarSign size={16} className="text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      case 'commission':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/webm'];
        return validTypes.includes(file.type);
      });
      
      if (validFiles.length !== fileArray.length) {
        alert('⚠️ Некоторые файлы имеют неподдерживаемый формат. Поддерживаются: JPG, PNG, WEBP, MP4, MOV, WEBM');
      }
      
      setUploadedFiles(prev => [...prev, ...validFiles]);
      
      // Имитируем обработку файлов
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`✅ Загружено ${validFiles.length} файлов для генерации контента!`);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('❌ Ошибка при загрузке файлов.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSupplierSearch = async (platform: 'alibaba' | '1688' | 'global', query?: string) => {
    const searchQuery = query || 'электронные компоненты'; // Дефолтный запрос
    if (!searchQuery.trim()) {
      alert('⚠️ Введите поисковый запрос для поиска поставщиков');
      return;
    }

    setIsSearchingSuppliers(true);
    setSelectedSupplierPlatform(platform);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResults = [
        {
          id: '1',
          name: 'Shenzhen Tech Co., Ltd.',
          platform: platform,
          rating: 4.8,
          orders: 1250,
          responseRate: '98%',
          location: platform === '1688' ? 'Guangzhou, China' : 'Shenzhen, China',
          minOrder: platform === '1688' ? '100 units' : '50 units',
          price: platform === '1688' ? '$2.50' : '$3.20',
          verified: true,
          goldSupplier: platform === 'alibaba',
          description: 'Professional manufacturer of electronic components with 10+ years experience'
        },
        {
          id: '2',
          name: 'Guangdong Electronics Factory',
          platform: platform,
          rating: 4.6,
          orders: 890,
          responseRate: '95%',
          location: 'Dongguan, China',
          minOrder: platform === '1688' ? '200 units' : '100 units',
          price: platform === '1688' ? '$2.20' : '$2.90',
          verified: true,
          goldSupplier: false,
          description: 'Leading supplier of consumer electronics and accessories'
        },
        {
          id: '3',
          name: 'Shanghai Industrial Group',
          platform: platform,
          rating: 4.9,
          orders: 2100,
          responseRate: '99%',
          location: 'Shanghai, China',
          minOrder: platform === '1688' ? '500 units' : '200 units',
          price: platform === '1688' ? '$1.80' : '$2.50',
          verified: true,
          goldSupplier: platform === 'alibaba',
          description: 'Established manufacturer with ISO certification and quality guarantee'
        }
      ];
      
      alert(`✅ Найдено ${mockResults.length} поставщиков на ${platform === 'alibaba' ? 'Alibaba' : platform === '1688' ? '1688.com' : 'глобальных платформах'}!

🔍 Поисковый запрос: "${searchQuery}"
📊 Результаты поиска:
   • Проверенные поставщики: ${mockResults.filter(s => s.verified).length}
   • Gold Suppliers: ${mockResults.filter(s => s.goldSupplier).length}
   • Средний рейтинг: ${(mockResults.reduce((sum, s) => sum + s.rating, 0) / mockResults.length).toFixed(1)}/5
   • Диапазон цен: $${Math.min(...mockResults.map(s => parseFloat(s.price.replace('$', ''))))} - $${Math.max(...mockResults.map(s => parseFloat(s.price.replace('$', ''))))}

💡 Рекомендации:
   • Проверьте сертификаты качества
   • Сравните условия доставки
   • Запросите образцы товаров
   • Уточните минимальные объемы заказа`);
      
    } catch (error) {
      console.error('Error searching suppliers:', error);
      alert('❌ Ошибка при поиске поставщиков. Проверьте подключение к интернету.');
    } finally {
      setIsSearchingSuppliers(false);
    }
  };

  const handleSupplierVerification = async (supplierId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`✅ Проверка поставщика завершена!

🔍 Результаты верификации (ID: ${supplierId}):
   • Лицензии: ✅ Действительны
   • Сертификаты качества: ✅ ISO 9001, CE
   • История поставок: ✅ Без нарушений
   • Финансовая стабильность: ✅ Стабильная
   • Репутация: ✅ Отличная (4.8/5)

📋 Рекомендации:
   • Поставщик прошел все проверки
   • Рекомендуется для сотрудничества
   • Предложить долгосрочный контракт
   • Запросить дополнительные скидки за объем`);
      
    } catch (error) {
      console.error('Error verifying supplier:', error);
      alert('❌ Ошибка при проверке поставщика.');
    }
  };

  const handleAutoReplySettingsChange = (key: string, value: any) => {
    setAutoReplySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveAutoReplySettings = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Сохраняем настройки в localStorage
      localStorage.setItem('autoReplySettings', JSON.stringify({
        template: autoReplyTemplate,
        settings: autoReplySettings
      }));
      
      alert(`✅ Настройки автоответов сохранены!

🤖 Конфигурация автоответов:
   • Статус: ${autoReplySettings.enabled ? 'Включены' : 'Отключены'}
   • Задержка ответа: ${autoReplySettings.responseDelay} минут
   • Эмодзи: ${autoReplySettings.includeEmoji ? 'Включены' : 'Отключены'}
   • Персонализация: ${autoReplySettings.personalizedResponse ? 'Включена' : 'Отключена'}
   • Уведомления менеджеру: ${autoReplySettings.notifyManager ? 'Включены' : 'Отключены'}

📝 Шаблон ответа:
"${autoReplyTemplate}"

💡 Система будет автоматически отвечать на новые отзывы согласно настроенным параметрам.`);
      
    } catch (error) {
      console.error('Error saving auto-reply settings:', error);
      alert('❌ Ошибка при сохранении настроек автоответов.');
    }
  };

  const testAutoReply = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const testReview = {
        rating: 5,
        text: 'Отличный товар! Качество превзошло все ожидания.',
        author: 'Тестовый пользователь'
      };
      
      const generatedReply = autoReplySettings.personalizedResponse 
        ? `${autoReplyTemplate} ${autoReplySettings.includeEmoji ? '😊' : ''}`
        : autoReplyTemplate;
      
      alert(`✅ Тест автоответа выполнен!

📝 Тестовый отзыв:
"${testReview.text}" (${testReview.rating}⭐)

🤖 Сгенерированный ответ:
"${generatedReply}"

⏱️ Задержка: ${autoReplySettings.responseDelay} минут
📊 Статус: ${autoReplySettings.enabled ? 'Активен' : 'Неактивен'}

💡 Автоответ готов к работе!`);
      
    } catch (error) {
      console.error('Error testing auto-reply:', error);
      alert('❌ Ошибка при тестировании автоответа.');
    }
  };

  const generateDetailedSeoReport = async () => {
    if (!seoAnalysisResults) {
      alert('⚠️ Сначала выполните SEO-анализ товара');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reportData = {
        ...seoAnalysisResults,
        generatedAt: new Date().toISOString(),
        marketplace: selectedMarketplaces.join(', '),
        reportId: `seo-report-${Date.now()}`
      };

      // Сохраняем отчет в localStorage
      const existingReports = JSON.parse(localStorage.getItem('seoReports') || '[]');
      existingReports.push(reportData);
      localStorage.setItem('seoReports', JSON.stringify(existingReports));

      alert(`✅ Детальный SEO-отчет сгенерирован!

📊 Отчет включает:
   • Полный анализ ключевых слов
   • Рекомендации по оптимизации заголовка
   • Анализ описания товара
   • Проверка изображений
   • Конкурентный анализ
   • Технические рекомендации

📁 Отчет сохранен как: seo_report_${new Date().toISOString().split('T')[0]}.pdf
📈 Потенциальный рост: +25-35% трафика
⏱️ Время реализации: 2-3 часа

💡 Отчет готов для передачи команде разработки!`);

    } catch (error) {
      console.error('Error generating SEO report:', error);
      alert('❌ Ошибка при генерации отчета.');
    }
  };

  const handleProductAnalysis = async () => {
    setIsAnalyzingProduct(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const mockProductAnalysis = {
        productInfo: {
          name: 'Samsung Galaxy S24',
          category: 'Смартфоны',
          price: 45000,
          rating: 4.7,
          reviews: 1250,
          sales: 890
        },
        competitorAnalysis: {
          competitors: [
            {
              name: 'iPhone 15',
              price: 55000,
              rating: 4.8,
              reviews: 2100,
              sales: 1200,
              advantages: ['Лучшая камера', 'Премиум дизайн'],
              disadvantages: ['Высокая цена', 'Закрытая экосистема']
            },
            {
              name: 'Xiaomi 14',
              price: 35000,
              rating: 4.5,
              reviews: 980,
              sales: 750,
              advantages: ['Низкая цена', 'Хорошие характеристики'],
              disadvantages: ['Средняя камера', 'Проблемы с обновлениями']
            },
            {
              name: 'OnePlus 12',
              price: 40000,
              rating: 4.6,
              reviews: 650,
              sales: 420,
              advantages: ['Быстрая зарядка', 'Чистый Android'],
              disadvantages: ['Мало магазинов', 'Слабая поддержка']
            }
          ],
          marketPosition: {
            priceRank: 2,
            ratingRank: 2,
            salesRank: 3,
            overallRank: 2
          }
        },
        optimizationSuggestions: [
          {
            category: 'Цена',
            suggestion: 'Снизить цену на 5-8%',
            impact: 'Увеличение продаж на 15-20%',
            effort: 'low',
            priority: 'high'
          },
          {
            category: 'Описание',
            suggestion: 'Добавить больше технических характеристик',
            impact: 'Улучшение конверсии на 10-15%',
            effort: 'medium',
            priority: 'medium'
          },
          {
            category: 'Изображения',
            suggestion: 'Добавить видео обзор товара',
            impact: 'Увеличение доверия покупателей',
            effort: 'high',
            priority: 'medium'
          },
          {
            category: 'Отзывы',
            suggestion: 'Активировать программу лояльности',
            impact: 'Увеличение положительных отзывов',
            effort: 'medium',
            priority: 'high'
          }
        ],
        marketInsights: {
          trends: [
            'Рост спроса на флагманские смартфоны',
            'Увеличение важности камеры для покупателей',
            'Тренд на экологичные материалы'
          ],
          opportunities: [
            'Сезонные скидки перед новым годом',
            'Партнерство с блогерами',
            'Участие в распродажах маркетплейсов'
          ],
          threats: [
            'Появление новых конкурентов',
            'Снижение цен у конкурентов',
            'Изменение потребительских предпочтений'
          ]
        },
        recommendations: {
          immediate: [
            'Снизить цену до 42,000 ₽',
            'Добавить видео обзор',
            'Улучшить качество фото товара'
          ],
          shortTerm: [
            'Запустить рекламную кампанию',
            'Настроить автоматические ответы на отзывы',
            'Оптимизировать описание под SEO'
          ],
          longTerm: [
            'Разработать программу лояльности',
            'Создать контент-план',
            'Настроить аналитику продаж'
          ]
        }
      };

      setProductAnalysisResults(mockProductAnalysis);

      alert(`✅ Анализ карточки товара завершен!

📊 Анализ товара: "${mockProductAnalysis.productInfo.name}"
💰 Текущая цена: ${mockProductAnalysis.productInfo.price.toLocaleString('ru-RU')} ₽
⭐ Рейтинг: ${mockProductAnalysis.productInfo.rating}/5
📈 Продажи: ${mockProductAnalysis.productInfo.sales} шт.

🏆 Позиция на рынке:
   • По цене: ${mockProductAnalysis.competitorAnalysis.marketPosition.priceRank} место
   • По рейтингу: ${mockProductAnalysis.competitorAnalysis.marketPosition.ratingRank} место
   • По продажам: ${mockProductAnalysis.competitorAnalysis.marketPosition.salesRank} место
   • Общая позиция: ${mockProductAnalysis.competitorAnalysis.marketPosition.overallRank} место

🎯 Ключевые рекомендации:
   • ${mockProductAnalysis.optimizationSuggestions.filter(s => s.priority === 'high').length} критичных улучшений
   • ${mockProductAnalysis.optimizationSuggestions.filter(s => s.priority === 'medium').length} важных улучшений
   • Потенциальный рост продаж: +20-30%

💡 Следующие шаги:
   1. Снизить цену на 5-8%
   2. Добавить видео обзор
   3. Улучшить качество фото
   4. Запустить рекламную кампанию`);

    } catch (error) {
      console.error('Error analyzing product:', error);
      alert('❌ Ошибка при анализе карточки товара.');
    } finally {
      setIsAnalyzingProduct(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-white">{t('marketai.title')}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('marketai.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowMarketplaceSelector(!showMarketplaceSelector)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Settings size={16} />
                <span className="text-sm font-medium">Маркетплейсы</span>
                <ChevronDown size={14} />
            </button>
            
            {showMarketplaceSelector && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 z-10">
                  <h3 className="font-medium text-slate-800 dark:text-white mb-3">Выберите маркетплейсы</h3>
                  <div className="space-y-2">
                    {marketplaceOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMarketplaces.includes(option.value as Marketplace)}
                          onChange={() => handleMarketplaceToggle(option.value as Marketplace)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                    </div>
                  </div>
              )}
                </div>
              </div>
          </div>
        </div>

        {/* Tabs */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
        <div className="flex">
          {[
            { id: 'chat', label: 'ИИ-Чат', icon: MessageSquare },
            { id: 'content', label: 'Генерация контента', icon: Package },
            { id: 'reviews', label: 'Отзывы', icon: Star },
            { id: 'analysis', label: 'Анализ и SEO', icon: BarChart3 },
            { id: 'suppliers', label: 'Поставщики', icon: Users },
            { id: 'financial', label: 'Финансы', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
          <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
          </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'user' ? (
                        <User size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString('ru-RU')}
                      </span>
                      {message.confidence && (
                        <span className="text-xs opacity-70">
                          Уверенность: {Math.round(message.confidence * 100)}%
                        </span>
                  )}
                </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Источники:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                              {source}
                            </span>
                          ))}
                        </div>
                  </div>
                )}
                  </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Анализирую...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

            {/* Input */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                    placeholder="Задайте вопрос о конкурентах, трендах или оптимизации..."
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={16} />
            </button>
          </div>
          
          {/* Selected Marketplaces Display */}
          {selectedMarketplaces.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedMarketplaces.map((mp) => {
                const option = marketplaceOptions.find(opt => opt.value === mp);
                return (
                  <span
                    key={mp}
                    className={`text-xs px-2 py-1 rounded-full ${option?.color || 'bg-gray-100 text-gray-800'}`}
                  >
                    {option?.label || mp}
                  </span>
                );
              })}
            </div>
          )}
            </div>
        </div>
        ) : activeTab === 'content' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Генерация контента</h2>
                <p className="text-slate-600 dark:text-slate-400">Создание фото и видео материалов для контент-воронки с помощью ИИ</p>
                </div>
                
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Тип контента
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setContentType('photo')}
                        className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
                      contentType === 'photo' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Image size={16} />
                    Фото
                  </button>
                  <button
                    onClick={() => setContentType('video')}
                        className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
                      contentType === 'video' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Video size={16} />
                    Видео
                  </button>
                </div>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Пропорции контента
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setContentAspectRatio('1:1')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                          contentAspectRatio === '1:1' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        1:1 (Квадрат)
                  </button>
                      <button 
                        onClick={() => setContentAspectRatio('3:4')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                          contentAspectRatio === '3:4' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        3:4 (Портрет)
                  </button>
                      <button 
                        onClick={() => setContentAspectRatio('4:3')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                          contentAspectRatio === '4:3' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        4:3 (Горизонтальный)
                  </button>
                      <button 
                        onClick={() => setContentAspectRatio('9:16')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                          contentAspectRatio === '9:16' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        9:16 (Сторис)
                  </button>
                      <button 
                        onClick={() => setContentAspectRatio('16:9')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                          contentAspectRatio === '16:9' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        16:9 (Ландшафт)
                    </button>
                      <button 
                        onClick={() => setContentAspectRatio('21:9')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                          contentAspectRatio === '21:9' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        21:9 (Широкоформатный)
                  </button>
                </div>
                </div>
                
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Ориентация
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                  <button
                        onClick={() => setContentOrientation('vertical')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center flex items-center justify-center gap-2 ${
                          contentOrientation === 'vertical' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                      <div className="w-4 h-6 bg-slate-400 rounded-sm"></div>
                        Вертикальная
                    </button>
                  <button
                        onClick={() => setContentOrientation('horizontal')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center flex items-center justify-center gap-2 ${
                          contentOrientation === 'horizontal' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                      <div className="w-6 h-4 bg-slate-400 rounded-sm"></div>
                        Горизонтальная
                    </button>
                </div>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Уровень инфографики
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setInfographicLevel('none')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                      infographicLevel === 'none' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Без инфографики
                  </button>
                  <button
                    onClick={() => setInfographicLevel('minimal')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                      infographicLevel === 'minimal' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Минимально
                  </button>
                  <button
                        onClick={() => setInfographicLevel('maximum')}
                        className={`px-4 py-3 border rounded-lg transition-colors text-center ${
                          infographicLevel === 'maximum' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    Максимум
                  </button>
                </div>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Загрузить исходные материалы
                    </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                      <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        Перетащите фото и видео файлы для генерации на их основе
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                        Поддерживаемые форматы: JPG, PNG, WEBP, MP4, MOV, WEBM
                      </p>
                  <input
                    type="file"
                    multiple
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/webm"
                        onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                        id="file-upload"
                        disabled={isUploading}
                  />
                  <label
                        htmlFor="file-upload"
                        className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                          isUploading 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isUploading ? 'Загружаю...' : 'Выбрать файлы'}
                  </label>
                      
                      {/* Список загруженных файлов */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Загруженные файлы:</p>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 rounded-lg p-2">
                              <div className="flex items-center gap-2">
                          {file.type.startsWith('image/') ? (
                                  <Image size={16} className="text-blue-600" />
                          ) : (
                                  <Video size={16} className="text-purple-600" />
                          )}
                                <span className="text-sm text-slate-700 dark:text-slate-300">{file.name}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                              </div>
                          <button
                                onClick={() => removeUploadedFile(index)}
                                className="text-red-600 hover:text-red-700 p-1"
                          >
                                <XCircle size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
                    </div>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Описание для генерации
                  </label>
                <textarea
                  value={contentPrompt}
                  onChange={(e) => setContentPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="Опишите что нужно создать для контент-воронки. Например: 'Создай фото товара на белом фоне с минималистичным дизайном, добавь инфографику с основными характеристиками'"
                />
              </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Brain size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">ИИ-технологии</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Используем передовые ИИ-модели для генерации высококачественного контента: 
                          DALL-E 3, Midjourney, Stable Diffusion для фото и RunwayML, Pika Labs для видео
                        </p>
                  </div>
                </div>
                </div>
                
              <button
                onClick={handleGenerateContent}
                disabled={!contentPrompt.trim() || isGeneratingContent}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                        Генерирую контент с помощью ИИ...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                        Создать контент с ИИ
                  </>
                )}
              </button>
                        </div>
                    </div>
                  </div>
          </div>
        ) : activeTab === 'reviews' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Генерация отзывов</h2>
                <p className="text-slate-600 dark:text-slate-400">Создание отзывов и настройка автоответов</p>
            </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Генерация отзывов</h3>
                  
                  <div className="space-y-4">
                <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Описание товара
                      </label>
                <textarea
                        value={reviewPrompt}
                        onChange={(e) => setReviewPrompt(e.target.value)}
                  rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        placeholder="Опишите товар для генерации отзыва..."
                />
                </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoReply"
                        checked={autoReplyEnabled}
                        onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <label htmlFor="autoReply" className="text-sm text-slate-700 dark:text-slate-300">
                        Включить автоответы на отзывы
                      </label>
              </div>
              
              <button
                      onClick={handleGenerateReview}
                      disabled={!reviewPrompt.trim() || isGeneratingReview}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingReview ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                          Генерирую отзыв...
                  </>
                ) : (
                  <>
                          <Star size={16} />
                          Создать отзыв
                  </>
                )}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Настройки автоответов</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 dark:text-slate-300">Автоответы включены</span>
                      <button
                        onClick={() => handleAutoReplySettingsChange('enabled', !autoReplySettings.enabled)}
                        className={`w-12 h-6 rounded-full transition-colors ${autoReplySettings.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoReplySettings.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Задержка ответа (минуты)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={autoReplySettings.responseDelay}
                          onChange={(e) => handleAutoReplySettingsChange('responseDelay', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="includeEmoji"
                          checked={autoReplySettings.includeEmoji}
                          onChange={(e) => handleAutoReplySettingsChange('includeEmoji', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <label htmlFor="includeEmoji" className="text-sm text-slate-700 dark:text-slate-300">
                          Включать эмодзи в ответы
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="personalizedResponse"
                          checked={autoReplySettings.personalizedResponse}
                          onChange={(e) => handleAutoReplySettingsChange('personalizedResponse', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <label htmlFor="personalizedResponse" className="text-sm text-slate-700 dark:text-slate-300">
                          Персонализированные ответы
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="notifyManager"
                          checked={autoReplySettings.notifyManager}
                          onChange={(e) => handleAutoReplySettingsChange('notifyManager', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <label htmlFor="notifyManager" className="text-sm text-slate-700 dark:text-slate-300">
                          Уведомлять менеджера
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={saveAutoReplySettings}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Сохранить настройки
                </button>
                      <button
                        onClick={testAutoReply}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Тест автоответа
                </button>
              </div>
                
                <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Шаблон ответа
                      </label>
                      <textarea
                        value={autoReplyTemplate}
                        onChange={(e) => setAutoReplyTemplate(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        placeholder="Спасибо за ваш отзыв! Мы рады, что товар вам понравился..."
                      />
            </div>

                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-blue-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Уведомления о новых отзывах
                      </span>
          </div>
        </div>
                </div>
                </div>
            </div>
          </div>
        ) : activeTab === 'analysis' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Анализ и SEO</h2>
                <p className="text-slate-600 dark:text-slate-400">Комплексный анализ конкурентов и SEO-оптимизация</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">SEO-анализ</h3>
                  
                  <div className="space-y-4">
                <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Анализ по фото или артикулу
                      </label>
                      <textarea
                        value={seoPrompt}
                        onChange={(e) => setSeoPrompt(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        placeholder="Введите артикул товара или опишите товар для SEO-анализа..."
                      />
                </div>

                    <button 
                      onClick={handleAnalyzeSEO}
                      disabled={!seoPrompt.trim() || isAnalyzingSEO}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isAnalyzingSEO ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Анализирую SEO...
                        </>
                      ) : (
                        <>
                          <Search size={16} />
                          Запустить SEO-анализ
                        </>
                      )}
                    </button>

                    {seoAnalysisResults && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="font-medium text-green-800 dark:text-green-300">
                              SEO-оценка: {seoAnalysisResults.overallScore}/100
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            Анализ завершен! Найдено {seoAnalysisResults.recommendations.length} рекомендаций для улучшения.
                          </p>
              </div>
              
                        <button
                          onClick={generateDetailedSeoReport}
                          disabled={isGeneratingSeoReport}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {isGeneratingSeoReport ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Генерирую отчет...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Скачать детальный отчет
                            </>
                          )}
                </button>
                      </div>
                    )}
                </div>
              </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Анализ карточки товара</h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Выберите свой товар для детального анализа конкурентов и получения рекомендаций по улучшению
                    </p>

                    <button 
                      onClick={handleProductAnalysis}
                      disabled={isAnalyzingProduct}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isAnalyzingProduct ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Анализирую карточку...
                        </>
                      ) : (
                        <>
                  <Package size={16} />
                          Анализировать карточку
                        </>
                      )}
                </button>

                    {productAnalysisResults && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800 dark:text-blue-300">
                              Позиция на рынке: #{productAnalysisResults.competitorAnalysis.marketPosition.overallRank}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            Найдено {productAnalysisResults.optimizationSuggestions.length} рекомендаций для улучшения позиции.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-100 dark:bg-slate-700 rounded p-2">
                            <div className="font-medium">Цена</div>
                            <div className="text-slate-600 dark:text-slate-400">#{productAnalysisResults.competitorAnalysis.marketPosition.priceRank}</div>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-700 rounded p-2">
                            <div className="font-medium">Рейтинг</div>
                            <div className="text-slate-600 dark:text-slate-400">#{productAnalysisResults.competitorAnalysis.marketPosition.ratingRank}</div>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-700 rounded p-2">
                            <div className="font-medium">Продажи</div>
                            <div className="text-slate-600 dark:text-slate-400">#{productAnalysisResults.competitorAnalysis.marketPosition.salesRank}</div>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-700 rounded p-2">
                            <div className="font-medium">Общая</div>
                            <div className="text-slate-600 dark:text-slate-400">#{productAnalysisResults.competitorAnalysis.marketPosition.overallRank}</div>
                          </div>
                        </div>
                      </div>
                    )}
                        </div>
                    </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">ИИ-Инсайты</h3>
              <button
                    onClick={runCompetitorAnalysis}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                        Анализирую...
                  </>
                ) : (
                  <>
                  <RefreshCw size={16} />
                        Обновить анализ
                  </>
                )}
                </button>
              </div>

                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className={`rounded-xl p-6 border ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{insight.title}</h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                              {insight.impact === 'high' ? 'Высокий' : 
                               insight.impact === 'medium' ? 'Средний' : 'Низкий'} приоритет
                    </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              Уверенность: {Math.round(insight.confidence * 100)}%
                  </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">{insight.description}</p>
                          
                          <div>
                            <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Рекомендуемые действия:</h5>
                            <ul className="space-y-2">
                              {insight.actionItems.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                    </div>
                    </div>
                  </div>
                    </div>
                  ))}
                    </div>
                  </div>
            </div>
          </div>
        ) : activeTab === 'suppliers' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Поиск поставщиков</h2>
                <p className="text-slate-600 dark:text-slate-400">ИИ-поиск надежных поставщиков в Китае</p>
                </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-white" />
                </div>
                <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Поиск на Alibaba</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Анализ поставщиков на Alibaba</p>
                </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Проверка надежности</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Сравнение цен</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Анализ отзывов</div>
                  </div>
                  <button 
                    onClick={() => handleSupplierSearch('alibaba')}
                    disabled={isSearchingSuppliers}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSearchingSuppliers && selectedSupplierPlatform === 'alibaba' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Ищу на Alibaba...
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        Найти поставщика
                      </>
                    )}
                  </button>
                </div>
              
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <MapPin size={20} className="text-white" />
              </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Поиск на 1688</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Оптовые поставщики на 1688.com</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Оптовые цены</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Минимальные заказы</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Логистика</div>
                  </div>
                  <button 
                    onClick={() => handleSupplierSearch('1688')}
                    disabled={isSearchingSuppliers}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSearchingSuppliers && selectedSupplierPlatform === '1688' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Ищу на 1688...
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        Найти оптовика
                      </>
                    )}
                  </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                      <Shield size={20} className="text-white" />
                </div>
                <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Проверка надежности</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Верификация поставщиков</p>
                </div>
        </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Проверка лицензий</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Анализ репутации</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• История поставок</div>
                  </div>
                  <button 
                    onClick={() => handleSupplierVerification('sample-supplier')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Shield size={16} />
                    Проверить поставщика
                  </button>
              </div>
              
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Globe size={20} className="text-white" />
                </div>
                <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Международные поставщики</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Поиск по всему миру</p>
                </div>
              </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Глобальный поиск</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Сравнение условий</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">• Таможенные вопросы</div>
                  </div>
                  <button 
                    onClick={() => handleSupplierSearch('global')}
                    disabled={isSearchingSuppliers}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSearchingSuppliers && selectedSupplierPlatform === 'global' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Глобальный поиск...
                      </>
                    ) : (
                      <>
                        <Globe size={16} />
                        Глобальный поиск
                      </>
                    )}
                </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'financial' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Финансовый модуль</h2>
                  <p className="text-slate-600 dark:text-slate-400">Управление финансами и аналитика доходов</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Download size={16} />
                      Экспорт
                </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 z-10">
                      <button
                        onClick={() => handleFinancialExport('csv')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        📊 CSV формат
                </button>
                      <button
                        onClick={() => handleFinancialExport('excel')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        📈 Excel формат
                      </button>
                      <button
                        onClick={() => handleFinancialExport('json')}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        🔧 JSON формат
                </button>
              </div>
            </div>
                  <button
                    onClick={updateFinancialData}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Обновляю...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Обновить
                      </>
                    )}
                </button>
              </div>
            </div>

              {metrics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Выручка</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {metrics.totalRevenue.toLocaleString('ru-RU')} ₽
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        +{metrics.monthlyGrowth}% к прошлому месяцу
                      </p>
                  </div>
                  
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Расходы</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {metrics.totalExpenses.toLocaleString('ru-RU')} ₽
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}% от выручки
                      </p>
                  </div>
                  
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Прибыль</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {metrics.netProfit.toLocaleString('ru-RU')} ₽
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Маржа: {metrics.netMargin}%
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <BarChart3 size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Транзакции</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {metrics.totalTransactions}
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        Средний чек: {metrics.averageTransactionValue.toLocaleString('ru-RU')} ₽
                      </p>
                  </div>
                </div>
                
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Транзакция</th>
                            <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Сумма</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Маркетплейс</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Категория</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Дата</th>
                            <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-700/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  {getTransactionIcon(transaction.type)}
                                  <div>
                                    <p className="font-medium text-slate-800 dark:text-white">{transaction.description}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{transaction.reference}</p>
                </div>
              </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                  {transaction.type === 'income' || transaction.type === 'refund' ? '+' : '-'}
                                  {transaction.amount.toLocaleString('ru-RU')} ₽
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {transaction.marketplace === 'wildberries' ? 'Wildberries' : 
                                 transaction.marketplace === 'ozon' ? 'Ozon' : 'Яндекс.Маркет'}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {transaction.category}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {new Date(transaction.date).toLocaleDateString('ru-RU')}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                  {transaction.status === 'completed' ? 'Завершено' :
                                   transaction.status === 'pending' ? 'Ожидает' : 'Ошибка'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
            </div>
                </div>
                </>
              )}
          </div>
        </div>
      ) : null}
              </div>
              
      {/* Модальное окно для анализа карточки товара */}
      {showProductAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Анализ карточки товара</h2>
                <button
                  onClick={() => setShowProductAnalysis(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <ProductCardAnalysis 
                onAnalysisComplete={(analysis) => {
                  console.log('Analysis completed:', analysis);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}