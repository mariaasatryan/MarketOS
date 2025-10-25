# Настройка GitHub Pages для MarketOS

## 🚨 Проблема: 404 "There isn't a GitHub Pages site here"

### Причина:
GitHub Pages не настроен или не работает правильно в репозитории.

## 🔧 Решение:

### 1. Проверьте настройки GitHub Pages:

1. **Перейдите в репозиторий:** https://github.com/mariaasatryan/MarketOS
2. **Нажмите "Settings"** (вкладка справа)
3. **Найдите раздел "Pages"** в левом меню
4. **Проверьте настройки:**
   - **Source:** должен быть "GitHub Actions"
   - **Status:** должен быть "Deployed from main"

### 2. Если GitHub Pages не настроен:

1. **В разделе "Pages":**
   - **Source:** выберите "GitHub Actions"
   - **Нажмите "Save"**

### 3. Если GitHub Actions не запускается:

1. **Перейдите в "Actions"** (вкладка в репозитории)
2. **Найдите workflow "Deploy to GitHub Pages"**
3. **Если он не запускается автоматически:**
   - Нажмите "Run workflow"
   - Выберите branch "main"
   - Нажмите "Run workflow"

### 4. Проверьте статус деплоя:

1. **В разделе "Actions":**
   - Найдите последний запуск "Deploy to GitHub Pages"
   - Проверьте, что все шаги выполнены успешно (зеленые галочки)
   - Если есть ошибки - исправьте ошибки

### 5. Альтернативное решение - ручной деплой:

Если GitHub Actions не работает, можно настроить ручной деплой:

1. **В настройках Pages:**
   - **Source:** выберите "Deploy from a branch"
   - **Branch:** выберите "main"
   - **Folder:** выберите "/ (root)"
   - **Нажмите "Save"**

2. **Создайте папку docs в корне репозитория:**
   ```bash
   mkdir docs
   cp -r dist/* docs/
   ```

3. **Закоммитьте изменения:**
   ```bash
   git add docs/
   git commit -m "Add docs folder for GitHub Pages"
   git push origin main
   ```

## 🔍 Диагностика:

### Проверьте URL:
- **Правильный URL:** https://mariaasatryan.github.io/MarketOS/
- **Неправильный URL:** https://mariaasatryan.github.io/ (без /MarketOS/)

### Проверьте файлы:
- ✅ `.nojekyll` - есть в корне
- ✅ `vite.config.ts` - base: '/MarketOS/'
- ✅ `dist/` - папка создается при сборке
- ✅ GitHub Actions workflow - настроен

## 📞 Если ничего не помогает:

1. **Проверьте права доступа** к репозиторию
2. **Убедитесь, что репозиторий публичный**
3. **Попробуйте пересоздать репозиторий**
4. **Обратитесь в поддержку GitHub**

## 🎯 Ожидаемый результат:

После правильной настройки:
- ✅ Сайт доступен по адресу: https://mariaasatryan.github.io/MarketOS/
- ✅ Загружается главная страница с логотипом
- ✅ Работает регистрация через Google
- ✅ Все функции платформы доступны
