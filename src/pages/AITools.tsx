import { useState } from 'react';
import { Upload, Copy, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

type AITab = 'descriptions' | 'autoReply' | 'supplierSearch';

const mockDescriptionResult = {
  title: 'Женская куртка оверсайз с утеплителем из синтепона',
  description: 'Стильная женская куртка оверсайз с утеплителем из синтепона — идеальный выбор для прохладной погоды. Изготовлена из высококачественного полиэстера с водоотталкивающей пропиткой. Современный свободный крой обеспечивает комфорт и свободу движений. Утеплитель из синтепона (200г/м²) сохраняет тепло в холодную погоду. Куртка подходит для повседневной носки, прогулок и активного отдыха. Универсальный дизайн легко сочетается с любыми элементами гардероба.',
  characteristics: [
    'Материал: полиэстер с водоотталкивающей пропиткой', 
    'Утеплитель: синтепон 200г/м²', 
    'Сезон: осень-зима', 
    'Стиль: оверсайз',
    'Цвет: черный/серый/бежевый',
    'Размеры: XS-XXL',
    'Особенности: ветрозащита, легкий вес'
  ],
  tags: ['куртка', 'зима', 'женская', 'мода', 'оверсайз', 'утеплитель', 'синтепон', 'полиэстер']
};

const mockReplyResult = 'Здравствуйте! Спасибо за отзыв 😊 Мы рады, что вам понравилась куртка. Приносим извинения за отсутствие запасной пуговицы — передадим информацию на склад. Мы можем выслать недостающую деталь, напишите нам в личные сообщения!';

const mockSuppliers = [
  {
    id: '1',
    platform: '1688',
    title: 'PU leather women\'s handbag',
    price: '38 ¥ / шт',
    supplier: 'Guangzhou Bags Factory',
    link: 'https://detail.1688.com/offer/1234567890.html',
    moq: '100 шт'
  },
  {
    id: '2',
    platform: 'Alibaba',
    title: 'Women\'s leather tote bag',
    price: '$6.80 / piece',
    supplier: 'Shenzhen Dream Bags Co.',
    link: 'https://www.alibaba.com/product-detail/1600000000000.html',
    moq: '50 pcs'
  },
  {
    id: '3',
    platform: 'Taobao',
    title: '女士手提包',
    price: '58 ¥',
    supplier: 'Fashion Bags Store',
    link: 'https://item.taobao.com/item.htm?id=1234567890123',
    moq: '1 шт'
  }
];

export function AITools() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<AITab>('descriptions');
  const [showResult, setShowResult] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [supplierFile, setSupplierFile] = useState<File | null>(null);
  const [brandStyle, setBrandStyle] = useState<string>('friendly');
  const [replyText, setReplyText] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const generateReply = (style: string) => {
    switch (style) {
      case 'official':
        return 'Здравствуйте! Благодарим за ваш отзыв. Мы ценим ваше мнение о качестве товара. Относительно отсутствующей запасной пуговицы - мы передадим данную информацию в отдел контроля качества. Для решения данного вопроса, пожалуйста, обратитесь в службу поддержки клиентов. Мы готовы предоставить недостающую деталь в кратчайшие сроки.';
      case 'friendly':
        return 'Привет! Спасибо за отзыв 😊 Рады, что куртка вам понравилась! По поводу пуговицы - передадим информацию на склад, чтобы такого больше не повторялось. Можем выслать недостающую деталь, просто напишите нам в личные сообщения!';
      case 'humorous':
        return 'Привет! 😄 Куртка-то классная, а вот пуговица решила сбежать в отпуск! 😅 Не переживайте, мы найдем эту беглянку и отправим вам новую. Напишите нам в личку, и мы быстро решим эту проблему!';
      case 'empathetic':
        return 'Здравствуйте! Понимаем ваше разочарование по поводу отсутствующей пуговицы. Мы очень ценим, что вы поделились своим опытом. Это поможет нам улучшить качество упаковки. Обязательно вышлем вам недостающую деталь - просто свяжитесь с нами в личных сообщениях.';
      default:
        return mockReplyResult;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Sparkles className="text-red-600 dark:text-blue-400" />
          {t('aiTools.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{t('aiTools.subtitle')}</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('descriptions'); setShowResult(false); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'descriptions'
              ? 'text-red-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('aiTools.descriptions.title')}
          {activeTab === 'descriptions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('autoReply'); setShowResult(false); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'autoReply'
              ? 'text-red-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('aiTools.autoReply.title')}
          {activeTab === 'autoReply' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('supplierSearch'); setShowResult(false); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'supplierSearch'
              ? 'text-red-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('aiTools.supplierSearch.title')}
          {activeTab === 'supplierSearch' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-blue-400" />
          )}
        </button>
      </div>

      {activeTab === 'descriptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              {t('aiTools.descriptions.subtitle')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('aiTools.descriptions.uploadPhoto')}
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setUploadedFile)}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                        Файл загружен: {uploadedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">Нажмите, чтобы выбрать другой файл</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Перетащите фото или нажмите для выбора
                      </p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('aiTools.descriptions.marketplace')}
                </label>
                <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  <option>Wildberries</option>
                  <option>Ozon</option>
                  <option>Яндекс Маркет</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('aiTools.descriptions.style')}
                </label>
                <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  <option>{t('aiTools.descriptions.styles.informational')}</option>
                  <option>{t('aiTools.descriptions.styles.selling')}</option>
                  <option>{t('aiTools.descriptions.styles.concise')}</option>
                  <option>{t('aiTools.descriptions.styles.emotional')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('aiTools.descriptions.length')}
                </label>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-600 hover:text-white transition-colors">
                    {t('aiTools.descriptions.lengths.short')}
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white">
                    {t('aiTools.descriptions.lengths.standard')}
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-600 hover:text-white transition-colors">
                    {t('aiTools.descriptions.lengths.extended')}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowResult(true)}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Sparkles size={20} />
                {t('aiTools.descriptions.generate')}
              </button>
            </div>
          </div>

          {showResult && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Результат</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Название</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{mockDescriptionResult.title}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Описание</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{mockDescriptionResult.description}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Характеристики</p>
                  <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
                    {mockDescriptionResult.characteristics.map((char, i) => (
                      <li key={i}>{char}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Теги</p>
                  <div className="flex flex-wrap gap-2">
                    {mockDescriptionResult.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-red-600 dark:text-blue-400 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Copy size={16} />
                    {t('aiTools.descriptions.copy')}
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'autoReply' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              {t('aiTools.autoReply.subtitle')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Отзыв покупателя
                </label>
                <textarea
                  rows={4}
                  defaultValue="Куртка классная, но пришла без запасной пуговицы."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('aiTools.autoReply.brandStyle')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['official', 'friendly', 'humorous', 'empathetic'].map(style => (
                    <button
                      key={style}
                      onClick={() => setBrandStyle(style)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        style === brandStyle
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-600 hover:text-white'
                      } transition-colors`}
                    >
                      {t(`aiTools.autoReply.styles.${style}`)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setReplyText(generateReply(brandStyle));
                  setShowResult(true);
                }}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Sparkles size={20} />
                {t('aiTools.autoReply.generateReply')}
              </button>
            </div>
          </div>

          {showResult && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Сгенерированный ответ</h3>

              <textarea
                rows={8}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
              />

              <div className="flex gap-2">
                <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {t('aiTools.autoReply.publish')}
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
                  <Copy size={16} />
                  {t('aiTools.descriptions.copy')}
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'supplierSearch' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              {t('aiTools.supplierSearch.subtitle')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('aiTools.supplierSearch.uploadPhoto')}
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setSupplierFile)}
                    className="hidden"
                  />
                  {supplierFile ? (
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                        Файл загружен: {supplierFile.name}
                      </p>
                      <p className="text-xs text-slate-500">Нажмите, чтобы выбрать другой файл</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Загрузите фото товара для поиска поставщиков
                      </p>
                    </>
                  )}
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('aiTools.supplierSearch.platform')}
                  </label>
                  <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    <option>{t('aiTools.supplierSearch.filters.all')}</option>
                    <option>{t('aiTools.supplierSearch.filters.alibaba')}</option>
                    <option>{t('aiTools.supplierSearch.filters.1688')}</option>
                    <option>{t('aiTools.supplierSearch.filters.taobao')}</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowResult(true)}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Sparkles size={20} />
                  {t('aiTools.supplierSearch.search')}
                </button>
              </div>
            </div>
          </div>

          {showResult && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Найдено {mockSuppliers.length} поставщиков
                </h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
                    {t('aiTools.supplierSearch.export')}
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    {t('aiTools.supplierSearch.saveToSheets')}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {mockSuppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-red-600 dark:text-blue-400 rounded text-xs font-medium">
                            {supplier.platform}
                          </span>
                          <h4 className="font-semibold text-slate-800 dark:text-white">{supplier.title}</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Цена</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{supplier.price}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">MOQ</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{supplier.moq}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Поставщик</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{supplier.supplier}</p>
                          </div>
                        </div>
                      </div>
                      <a
                        href={supplier.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 p-2 text-red-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
