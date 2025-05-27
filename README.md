# Cookie Consent Hub

Гибкая и настраиваемая система уведомлений о согласии на использование файлов cookie, которая помогает веб-сайтам соблюдать требования GDPR и других законов о конфиденциальности.

## Основные возможности

- 🎯 **Множественные типы модальных окон** (начальное, настройки, улучшение опыта, простое уведомление)
- 🎨 **Полностью настраиваемый внешний вид** и поведение
- 📂 **Поддержка различных категорий cookie** с гибкой конфигурацией
- 🚀 **Автоматическая загрузка скриптов** на основе пользовательского согласия
- 📱 **Адаптивный дизайн** для всех устройств
- 🌙 **Поддержка темной темы**
- ♿ **Функции доступности** (ARIA, клавиатурная навигация)
- 📊 **Интеграция с GTM и Matomo (пока не настроена)**
- 🔒 **Встроенная безопасность** (XSS защита, CSP заголовки)

## Установка

```bash
npm install cookie-consent-hub
```

## Быстрый старт

### Основная инициализация

```html
<!-- Подключите стили -->
<link rel="stylesheet" href="css/main.min.css">

<!-- Подключите скрипт -->
<script type="module" src="js/index.js"></script>
```

```javascript
// Инициализация с дефолтными настройками
const cookieConsent = CookieConsent.init();

// Или с кастомной конфигурацией
const cookieConsent = CookieConsent.init({
    simpleMode: false,
    visual: {
        overlay: {
            color: 'rgba(0, 0, 0, 0.7)'
        }
    }
});
```

### Работа с API

```javascript
// Проверить согласие для конкретной категории
if (CookieConsent.hasConsent('analytics')) {
    // Загружаем аналитику
    loadAnalyticsScript();
}

// Получить все согласия
const allConsents = CookieConsent.getConsent();
console.log(allConsents); // { necessary: true, analytics: false, ... }

// Открыть настройки
CookieConsent.openSettings();

// Показать/скрыть модальное окно программно
CookieConsent.show();
CookieConsent.hide();
```

## Конфигурация

### Типы модальных окон

| Тип | Описание | Когда показывается |
|-----|----------|-------------------|
| `initial` | Первоначальный баннер согласия | При первом посещении сайта |
| `manualSettings` | Подробные настройки категорий | По клику на кнопку "Настройки" |
| `experienceImprove` | Предложение улучшить опыт | После выбора минимальных настроек |
| `simpleNotification` | Простое уведомление | В простом режиме (simpleMode: true) |

### Настройки внешнего вида

```javascript
{
  visual: {
    overlay: {
      blur: '5px',                    // Размытие фона
      color: 'rgba(0, 0, 0, 0.5)',    // Цвет оверлея
      zIndex: 9998                    // z-index оверлея
    },
    modal: {
      zIndex: 9999,                   // z-index модального окна
      maxWidth: '500px',              // Максимальная ширина
      borderRadius: '12px',           // Скругление углов
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' // Тень
    },
    modalTypes: {
      initial: {
        position: 'center',           // center, top, bottom
        showOverlay: true,            // Показывать затемнение
        allowClose: true,             // Разрешить закрытие
        closeOnOverlayClick: true,    // Закрывать по клику на оверлей
        animation: 'fade',            // fade, slide, none
        preventScroll: true,          // Блокировать скролл страницы
        showExperienceImprove: true   // Показывать баннер улучшения опыта
      }
      // Настройки для других типов модальных окон...
    }
  }
}
```

### Категории cookie

```javascript
{
  categories: {
    necessary: {
      title: 'Необходимые',
      description: 'Эти файлы cookie необходимы для работы сайта и не могут быть отключены.',
      required: true,                 // Обязательная категория
      scripts: [
        {
          type: 'file',               // Тип скрипта: file, inline, event, gtm
          path: '/js/necessary.js'    // Путь к файлу
        }
      ]
    },
    analytics: {
      title: 'Аналитика',
      description: 'Помогают улучшать сайт, собирая информацию о его использовании.',
      required: false,
      scripts: [
        {
          type: 'file',
          path: '/js/analytics.js'
        },
        {
          type: 'event',              // Кастомное событие
          name: 'loadAnalytics',
          data: {
            category: 'analytics'
          }
        },
        {
          type: 'inline',             // Встроенный код
          code: 'console.log("Analytics loaded");'
        }
      ]
    }
    // Другие категории...
  }
}
```

### Тексты интерфейса

```javascript
{
  texts: {
    mainBanner: {
      title: 'Настройки файлов cookie',
      description: 'Мы используем файлы cookie для улучшения вашего опыта.\nВыберите, какие файлы cookie вы хотите принять.',
      acceptAll: 'Принять все',
      acceptNecessary: 'Только необходимые',
      settings: 'Настроить предпочтения'
    },
    experienceImprove: {
      title: 'Улучшите свой опыт',
      description: 'Разрешите дополнительные файлы cookie для персонализации.',
      acceptAll: 'Принять все',
      keepChoice: 'Оставить текущий выбор'
    },
    settings: {
      title: 'Настройки cookie',
      description: 'Выберите категории файлов cookie.',
      acceptAll: 'Принять все',
      acceptSelected: 'Сохранить выбор'
    }
  }
}
```

### Интеграция с системами аналитики

```javascript
{
  tagManagers: {
    gtm: {
      enabled: true,
      id: 'GTM-XXXXXXX',
      events: {
        consent: 'cookieConsent',     // Событие согласия
        settings: 'cookieSettings'    // Событие открытия настроек
      },
      dataLayer: 'dataLayer'
    },
    matomo: {
      enabled: true,
      siteId: '1',
      trackerUrl: 'https://your-matomo.com/'
    }
  }
}
```

## Простой режим

Простой режим автоматически принимает все согласия и показывает только информационное уведомление:

```javascript
const cookieConsent = CookieConsent.init({
    simpleMode: true
});
```

## События

Система генерирует события, на которые можно подписаться:

```javascript
// Событие изменения согласия
window.addEventListener('cookieConsent', (event) => {
    const consent = event.detail;
    console.log('Consent updated:', consent);
    
    // Загружаем скрипты на основе согласия
    if (consent.analytics) {
        loadAnalyticsScript();
    }
});

// Кастомные события из скриптов
window.addEventListener('cookieConsent:loadAnalytics', (event) => {
    console.log('Analytics event triggered:', event.detail);
});
```

## Отладка

Включите режим отладки для диагностики проблем:

```javascript
// Включить отладку
window.__COOKIE_CONSENT_DEBUG__ = true;

// Доступные функции отладки
debugCookieConsent.checkOverlay();     // Проверить состояние оверлея
debugCookieConsent.checkModal();       // Проверить состояние модального окна
debugCookieConsent.openSettings();     // Открыть настройки
debugCookieConsent.testHide();         // Тестировать скрытие
```

## CSS-переменные

Настройте внешний вид через CSS-переменные:

```css
:root {
  /* Оверлей */
  --cookie-consent-overlay-color: rgba(0, 0, 0, 0.5);
  --cookie-consent-blur: 5px;
  --cookie-consent-overlay-z-index: 9998;

  /* Модальное окно */
  --cookie-consent-z-index: 9999;
  --cookie-consent-max-width: 500px;
  --cookie-consent-border-radius: 12px;
  --cookie-consent-box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Темная тема */
.cookie-consent--dark {
  background: #333;
  color: #fff;
}
```

## Безопасность

Система включает встроенные механизмы безопасности:

- **XSS защита**: Все пользовательские данные экранируются
- **HTML санитизация**: Разрешены только безопасные теги
- **CSP заголовки**: Автоматическое добавление Content Security Policy
- **CSRF токены**: Защита от межсайтовой подделки запросов

## Совместимость

- **Браузеры**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Фреймворки**: Vanilla JS, React, Vue, Angular
- **Устройства**: Desktop, Tablet, Mobile

## Разработка

### Требования

- Node.js 14+
- npm 6+

### Установка для разработки

```bash
git clone https://github.com/yourusername/cookie-consent-hub.git
cd cookie-consent-hub
npm install
```

### Доступные команды

```bash
npm start           # Запуск dev сервера
npm run build       # Сборка для продакшена
npm test            # Запуск тестов
npm run lint        # Проверка кода
npm run sass        # Компиляция SASS
npm run sass:watch  # Отслеживание изменений SASS
```

### Структура проекта

```
cookie-consent-hub/
├── js/
│   ├── cookie-consent.js        # Основной класс
│   ├── cookie-consent-config.js # Конфигурация
│   └── index.js                 # Точка входа
├── sass/
│   ├── _variables.sass          # Переменные
│   ├── _mixins.sass            # Миксины
│   ├── _animations.sass        # Анимации
│   └── _cookie-consent.sass    # Основные стили
├── css/
│   └── main.min.css            # Скомпилированные стили
└── index.html                  # Демо страница
```

## Миграция с предыдущих версий

### С ConsentNotification на CookieConsent

```javascript
// Старый API
const consent = new ConsentNotification(config);
consent.openSettings();

// Новый API
const consent = CookieConsent.init(config);
CookieConsent.openSettings();
```

### Изменения в структуре конфигурации

- Убран `modalTypes.FIRST_VISIT_SETTINGS`
- Упрощена структура `visual.modalTypes`
- Изменены названия некоторых событий

## Лицензия

MIT License - подробности в файле [LICENSE](LICENSE).

## Благодарности

- [GDPR](https://gdpr.eu/) - Общий регламент по защите данных
- [152-ФЗ](http://www.consultant.ru/document/cons_doc_LAW_61801/) - Федеральный закон о персональных данных