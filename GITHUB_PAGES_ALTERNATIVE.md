# 🔧 Альтернативное решение для GitHub Pages

## ❌ Проблема:
GitHub Actions выдает ошибку "The process '/usr/bin/git' failed with exit code 128"

## 🚀 РЕШЕНИЕ (выполните пошагово):

### МЕТОД 1: Настройка через Settings (Рекомендуется)

1. **Откройте репозиторий:** https://github.com/mariaasatryan/MarketOS
2. **Нажмите "Settings"** (вкладка справа)
3. **Найдите "Pages"** в левом меню
4. **Настройте:**
   - **Source:** выберите **"Deploy from a branch"**
   - **Branch:** выберите **"main"**
   - **Folder:** выберите **"/ (root)"**
   - **Нажмите "Save"**

### МЕТОД 2: Создание папки docs (если МЕТОД 1 не работает)

1. **Создайте папку docs в корне проекта:**
   ```bash
   mkdir docs
   cp -r dist/* docs/
   ```

2. **Закоммитьте изменения:**
   ```bash
   git add docs/
   git commit -m "Add docs folder for GitHub Pages"
   git push origin main
   ```

3. **В настройках Pages:**
   - **Source:** выберите **"Deploy from a branch"**
   - **Branch:** выберите **"main"**
   - **Folder:** выберите **"/docs"**
   - **Нажмите "Save"**

### МЕТОД 3: Ручной деплой (если ничего не работает)

1. **Соберите проект локально:**
   ```bash
   npm run build
   ```

2. **Создайте папку docs:**
   ```bash
   mkdir docs
   cp -r dist/* docs/
   ```

3. **Закоммитьте и загрузите:**
   ```bash
   git add docs/
   git commit -m "Manual deploy to GitHub Pages"
   git push origin main
   ```

4. **В настройках Pages:**
   - **Source:** **"Deploy from a branch"**
   - **Branch:** **"main"**
   - **Folder:** **"/docs"**

## 🔍 Проверка результата:

После настройки подождите 2-5 минут и проверьте:
- **URL:** https://mariaasatryan.github.io/MarketOS/
- **Должна загрузиться** главная страница
- **Не должно быть** ошибки 404

## 📞 Если все еще не работает:

1. **Проверьте права доступа** к репозиторию
2. **Убедитесь, что репозиторий публичный**
3. **Попробуйте пересоздать репозиторий**
4. **Обратитесь в поддержку GitHub**

## 🎯 Ожидаемый результат:

- ✅ Сайт доступен: https://mariaasatryan.github.io/MarketOS/
- ✅ Загружается главная страница с логотипом
- ✅ Работает регистрация через Google
- ✅ Все функции платформы доступны

**ВЫПОЛНИТЕ МЕТОД 1 ПРЯМО СЕЙЧАС!** 🚀
