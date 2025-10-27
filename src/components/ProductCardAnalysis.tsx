import React, { useState } from 'react';
import { Package, Search, TrendingUp, Star, Eye, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  marketplace: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  sales: number;
  image: string;
  description: string;
}

interface CompetitorAnalysis {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  sales: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ProductCardAnalysisProps {
  onAnalysisComplete: (analysis: CompetitorAnalysis[]) => void;
}

export function ProductCardAnalysis({ onAnalysisComplete }: ProductCardAnalysisProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<CompetitorAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Моковые данные товаров
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Смартфон Samsung Galaxy S24',
      marketplace: 'wildberries',
      category: 'Электроника',
      price: 89990,
      rating: 4.8,
      reviews: 1250,
      sales: 450,
      image: '/images/products/samsung-s24.jpg',
      description: 'Флагманский смартфон с камерой 200MP и процессором Snapdragon 8 Gen 3'
    },
    {
      id: '2',
      name: 'Наушники Apple AirPods Pro',
      marketplace: 'ozon',
      category: 'Аудио',
      price: 24990,
      rating: 4.6,
      reviews: 890,
      sales: 320,
      image: '/images/products/airpods-pro.jpg',
      description: 'Беспроводные наушники с активным шумоподавлением и пространственным звуком'
    },
    {
      id: '3',
      name: 'Планшет iPad Air',
      marketplace: 'ym',
      category: 'Планшеты',
      price: 59990,
      rating: 4.7,
      reviews: 650,
      sales: 180,
      image: '/images/products/ipad-air.jpg',
      description: 'Планшет с чипом M2, дисплеем 10.9" и поддержкой Apple Pencil'
    }
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const analyzeProduct = async (product: Product) => {
    setIsAnalyzing(true);
    try {
      // Имитация ИИ-анализа карточки товара
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Моковые результаты анализа конкурентов
      const mockAnalysis: CompetitorAnalysis[] = [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          price: 99990,
          rating: 4.9,
          reviews: 2100,
          sales: 680,
          strengths: ['Премиальный бренд', 'Высокое качество', 'Большое количество отзывов'],
          weaknesses: ['Высокая цена', 'Ограниченная совместимость'],
          recommendations: ['Снизить цену на 10-15%', 'Усилить акценты на уникальных характеристиках', 'Добавить больше отзывов']
        },
        {
          id: '2',
          name: 'Xiaomi 14 Pro',
          price: 69990,
          rating: 4.5,
          reviews: 980,
          sales: 420,
          strengths: ['Хорошее соотношение цена/качество', 'Мощные характеристики'],
          weaknesses: ['Низкий рейтинг', 'Мало отзывов'],
          recommendations: ['Улучшить качество товара', 'Стимулировать отзывы', 'Снизить цену']
        },
        {
          id: '3',
          name: 'OnePlus 12',
          price: 79990,
          rating: 4.7,
          reviews: 1200,
          sales: 380,
          strengths: ['Быстрая зарядка', 'Хороший дисплей'],
          weaknesses: ['Средние продажи', 'Конкуренция с Samsung'],
          recommendations: ['Улучшить маркетинг', 'Добавить уникальные функции', 'Оптимизировать описание']
        }
      ];

      setAnalysisResults(mockAnalysis);
      onAnalysisComplete(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing product:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Поиск товара */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Выберите товар для анализа</h3>
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию или категории..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProduct?.id === product.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 dark:text-white text-sm">{product.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{product.category}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Цена:</span>
                  <span className="font-medium">{product.price.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Рейтинг:</span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500" />
                    {product.rating}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Продажи:</span>
                  <span>{product.sales}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-slate-800 dark:text-white mb-2">Выбранный товар:</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{selectedProduct.description}</p>
            <button
              onClick={() => analyzeProduct(selectedProduct)}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Анализирую...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Анализировать карточку
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Результаты анализа */}
      {analysisResults.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Результаты ИИ-анализа</h3>
          <div className="space-y-4">
            {analysisResults.map((competitor) => (
              <div key={competitor.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-slate-800 dark:text-white">{competitor.name}</h4>
                  <div className="text-right text-sm">
                    <div className="font-medium text-slate-800 dark:text-white">
                      {competitor.price.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Star size={12} className="text-yellow-500" />
                      {competitor.rating} ({competitor.reviews} отзывов)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Сильные стороны
                    </h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {competitor.strengths.map((strength, index) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Слабые стороны
                    </h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {competitor.weaknesses.map((weakness, index) => (
                        <li key={index}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                      <TrendingUp size={14} />
                      Рекомендации
                    </h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {competitor.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
