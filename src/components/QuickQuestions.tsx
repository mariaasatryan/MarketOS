import { useState } from 'react';
import { MessageSquare, TrendingUp, Package, DollarSign, Truck, Star } from 'lucide-react';

interface QuickQuestion {
  id: string;
  question: string;
  icon: React.ReactNode;
  category: string;
}

interface QuickQuestionsProps {
  onQuestionClick: (question: string) => void;
  selectedMarketplaces: string[];
}

const quickQuestions: QuickQuestion[] = [
  {
    id: '1',
    question: 'Как снизить комиссии на маркетплейсах?',
    icon: <DollarSign size={16} />,
    category: 'Финансы'
  },
  {
    id: '2',
    question: 'Как оптимизировать карточки товаров?',
    icon: <Package size={16} />,
    category: 'Оптимизация'
  },
  {
    id: '3',
    question: 'Какие инструменты рекламы использовать?',
    icon: <TrendingUp size={16} />,
    category: 'Реклама'
  },
  {
    id: '4',
    question: 'Как настроить логистику?',
    icon: <Truck size={16} />,
    category: 'Логистика'
  },
  {
    id: '5',
    question: 'Как работать с отзывами?',
    icon: <Star size={16} />,
    category: 'Отзывы'
  },
  {
    id: '6',
    question: 'Как увеличить конверсию?',
    icon: <MessageSquare size={16} />,
    category: 'Аналитика'
  }
];

export function QuickQuestions({ onQuestionClick, selectedMarketplaces }: QuickQuestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');

  const categories = ['Все', 'Финансы', 'Оптимизация', 'Реклама', 'Логистика', 'Отзывы', 'Аналитика'];

  const filteredQuestions = quickQuestions.filter(q => 
    selectedCategory === 'Все' || q.category === selectedCategory
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Быстрые вопросы</h3>
        <div className="flex gap-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredQuestions.map(question => (
          <button
            key={question.id}
            onClick={() => onQuestionClick(question.question)}
            className="w-full flex items-center gap-3 p-3 text-left bg-white dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
          >
            <div className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {question.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                {question.question}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {question.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedMarketplaces.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Контекст: {selectedMarketplaces.length} маркетплейс(ов) выбран(о)
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedMarketplaces.map(mp => {
              const getMarketplaceColor = (marketplace: string) => {
                switch (marketplace) {
                  case 'wildberries':
                    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
                  case 'ozon':
                    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                  case 'ym':
                    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
                  default:
                    return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
                }
              };
              
              return (
                <span
                  key={mp}
                  className={`text-xs px-2 py-1 rounded-full ${getMarketplaceColor(mp)}`}
                >
                  {mp === 'wildberries' ? 'Wildberries' :
                   mp === 'ozon' ? 'Ozon' :
                   mp === 'ym' ? 'Яндекс.Маркет' : mp}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
