# 🚀 MarketOS Deployment Guide

## Автоматический деплой

### Способ 1: GitHub Actions (Рекомендуемый)
GitHub Actions автоматически деплоит сайт при каждом push в main ветку.

**Настройка:**
1. Перейдите в Settings → Pages в вашем GitHub репозитории
2. Выберите "GitHub Actions" как источник
3. Workflow файл уже создан в `.github/workflows/deploy.yml`

### Способ 2: Локальный деплой

#### Быстрый деплой:
```bash
npm run deploy:auto
```

#### Полный деплой с проверками:
```bash
npm run deploy
```

#### Ручной деплой:
```bash
# 1. Собрать проект
npm run build

# 2. Скопировать в docs
cp -r dist/* docs/

# 3. Закоммитить и отправить
git add docs/
git commit -m "Deploy updates"
git push origin main
```

## 🔧 Настройка GitHub Pages

1. **Перейдите в Settings** вашего GitHub репозитория
2. **Найдите раздел "Pages"** в левом меню
3. **Выберите источник:**
   - **GitHub Actions** (для автоматического деплоя)
   - **Deploy from a branch** → docs/ (для ручного деплоя)

## 📝 Workflow файл

Файл `.github/workflows/deploy.yml` содержит:
- Автоматическую сборку при push в main
- Деплой на GitHub Pages
- Кэширование node_modules для ускорения

## ⚡ Быстрые команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Деплой
npm run deploy:auto

# Проверка типов
npm run typecheck

# Линтинг
npm run lint
```

## 🌐 URL сайта

После деплоя сайт будет доступен по адресу:
**https://mariaasatryan.github.io/MarketOS/**

## ⏱️ Время обновления

- **GitHub Actions**: 2-3 минуты
- **Ручной деплой**: 1-2 минуты
- **Кэш браузера**: Очистите кэш или откройте в режиме инкогнито

## 🐛 Troubleshooting

### Если деплой не работает:
1. Проверьте права доступа к репозиторию
2. Убедитесь, что GitHub Pages включен
3. Проверьте логи в Actions tab

### Если изменения не видны:
1. Очистите кэш браузера (Ctrl+F5)
2. Откройте в режиме инкогнито
3. Подождите 2-3 минуты

---

**Теперь каждый раз, когда вы делаете изменения в коде, просто запустите `npm run deploy:auto` и сайт автоматически обновится!** 🚀
