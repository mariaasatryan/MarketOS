import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Settings, ChevronDown } from 'lucide-react';
import { Marketplace } from '../types';
import { gptService, type GPTMessage, type GPTResponse } from '../services/gptService';
import { QuickQuestions } from '../components/QuickQuestions';
import { SourcesDisplay } from '../components/SourcesDisplay';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  marketplaces?: Marketplace[];
  sources?: string[];
  confidence?: number;
}

interface GPTResponse {
  message: string;
  sources?: string[];
}

export default function MarketOSGPT() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я MarketOS GPT - ваш умный помощник по российским маркетплейсам. Задавайте любые вопросы о работе с Озон, Wildberries, Яндекс.Маркет и другими площадками!',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Marketplace[]>(['wildberries', 'ozon', 'ym']);
  const [showMarketplaceSelector, setShowMarketplaceSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const marketplaceOptions = [
    { value: 'wildberries', label: 'Wildberries', color: 'bg-red-100 text-red-800' },
    { value: 'ozon', label: 'Ozon', color: 'bg-green-100 text-green-800' },
    { value: 'ym', label: 'Яндекс.Маркет', color: 'bg-purple-100 text-purple-800' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMarketplaceToggle = (marketplace: Marketplace) => {
    setSelectedMarketplaces(prev => {
      if (prev.includes(marketplace)) {
        return prev.filter(mp => mp !== marketplace);
      } else {
        return [...prev, marketplace];
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      marketplaces: selectedMarketplaces,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Подготавливаем историю сообщений для GPT
      const conversationHistory: GPTMessage[] = messages
        .slice(-10) // Последние 10 сообщений для контекста
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Вызываем GPT сервис
      const response = await gptService.askQuestion(
        inputMessage,
        { marketplaces: selectedMarketplaces },
        conversationHistory
      );
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        sources: response.sources,
        confidence: response.confidence,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('GPT Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-white">MarketOS GPT</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Умный помощник по маркетплейсам</p>
            </div>
          </div>
          
          {/* Marketplace Selector */}
          <div className="relative">
            <button
              onClick={() => setShowMarketplaceSelector(!showMarketplaceSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings size={16} />
              <span className="text-sm font-medium">
                {selectedMarketplaces.length === 3 ? 'Все маркетплейсы' : 
                 selectedMarketplaces.length === 0 ? 'Выберите маркетплейсы' :
                 `${selectedMarketplaces.length} выбрано`}
              </span>
              <ChevronDown size={16} className={`transition-transform ${showMarketplaceSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showMarketplaceSelector && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                <div className="p-3">
                  <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-3">Выберите маркетплейсы</h3>
                  <div className="space-y-2">
                    {marketplaceOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMarketplaces.includes(option.value as Marketplace)}
                          onChange={() => handleMarketplaceToggle(option.value as Marketplace)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                      </label>
                    ))}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setSelectedMarketplaces(['wildberries', 'ozon', 'ym'])}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Выбрать все
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Questions - показываем только если нет сообщений или мало сообщений */}
        {messages.length <= 1 && (
          <div className="mb-6">
            <QuickQuestions 
              onQuestionClick={handleQuickQuestion}
              selectedMarketplaces={selectedMarketplaces}
            />
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}
            
            <div
              className={`max-w-3xl px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {message.timestamp.toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {message.role === 'assistant' && (message.sources || message.confidence) && (
                <SourcesDisplay 
                  sources={message.sources} 
                  confidence={message.confidence} 
                />
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-slate-600 dark:text-slate-300" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-slate-600 dark:text-slate-400">Думаю...</span>
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
              placeholder="Задайте вопрос о маркетплейсах..."
              className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
        
        {/* Selected Marketplaces Display */}
        {selectedMarketplaces.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Контекст:</span>
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
  );
}
