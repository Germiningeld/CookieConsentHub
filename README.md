# Cookie Consent Hub

Гибкая и настраиваемая система уведомлений о согласии на использование файлов cookie, которая помогает веб-сайтам соблюдать требования GDPR и других законов о конфиденциальности.

## Основные возможности

- 🎯 **Множественные типы модальных окон** (начальное, настройки, улучшение опыта, простое уведомление)
- 🎨 **Полностью настраиваемый внешний вид** и поведение
- 📂 **Поддержка различных категорий cookie** с гибкой конфигурацией
- 🚀 **Автоматическая загрузка скриптов** на основе пользовательского согласия
- 📱 **Адаптивный дизайн** для всех устройств
- ♿ **Функции доступности** (ARIA, клавиатурная навигация)
- 📊 **Интеграция с GTM** (Matomo планируется)
- 🔒 **Встроенная безопасность** (XSS защита, CSP заголовки)
- 🐛 **Система отладки** с детальным логированием

## Установка

Скопируйте файлы проекта и подключите необходимые ресурсы:

```html
<!-- Подключите стили (создайте из SASS или используйте готовые) -->
<link rel="stylesheet" href="css/main.min.css">

<!-- Подключите скрипт -->
<script type="module" src="js/index.js"></script>
```

## Быстрый старт

### Основная инициализация

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

// Открыть настройки (правильные способы)
window.cookieConsent.openSettings();
// Или
if (CookieConsent.instance) {
    CookieConsent.instance._openSettings();
}

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

### Активные категории cookie

По умолчанию включены только две категории:

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
          path: '/js/scripts/necessary.js'
        }
      ]
    },
    analytics: {
      title: 'Аналитика',
      description: 'Помогают улучшать сайт, собирая информацию о его использовании.',
      required: false,
      scripts: [
        {
          type: 'event',              // Кастомное событие
          name: 'loadAnalytics',
          data: {
            source: 'cookie-consent',
            category: 'analytics'
          }
        }
      ]
    }
    // marketing и functional закомментированы в конфигурации
    // Раскомментируйте их при необходимости
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
    },
    simpleNotification: {
      title: 'Используем куки и рекомендательные технологии',
      description: 'Это чтобы сайт работал лучше.\nОставаясь с нами, вы соглашаетесь на использование файлов куки. <a href="#" class="cookie-consent__link">Подробнее</a>',
      acceptButton: 'OK'
    }
  }
}
```

### Интеграция с системами аналитики

#### Google Tag Manager (активен)

```javascript
{
  tagManagers: {
    gtm: {
      enabled: true,
      id: 'GTM-5S7NM4HM',            // Замените на ваш GTM ID
      events: {
        consent: 'cookieConsent',     // Событие согласия
        settings: 'cookieSettings'    // Событие открытия настроек
      },
      dataLayer: 'dataLayer'
    }
  }
}
```

#### Matomo (пока не активен)

```javascript
{
  tagManagers: {
    matomo: {
      enabled: false,                 // Отключен по умолчанию
      siteId: null,
      trackerUrl: null
    }
  }
}
```

## Простой режим

Простой режим автоматически принимает все согласия, но все равно показывает информационное уведомление, которое пользователь должен закрыть:

```javascript
const cookieConsent = CookieConsent.init({
    simpleMode: true
});
```

**Поведение в простом режиме:**
1. Все согласия принимаются автоматически
2. Все скрипты загружаются сразу
3. Показывается `simpleNotification` с кнопкой "OK"
4. Пользователь должен нажать "OK" чтобы закрыть уведомление

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

// Или через функцию
debugCookieConsent.enableDebug();

// Доступные функции отладки
debugCookieConsent.checkOverlay();     // Проверить состояние оверлея
debugCookieConsent.checkModal();       // Проверить состояние модального окна
debugCookieConsent.openSettings();     // Открыть настройки
debugCookieConsent.testHide();         // Тестировать скрытие
debugCookieConsent.hideOverlay();      // Принудительно скрыть оверлей
debugCookieConsent.showOverlay();      // Принудительно показать оверлей

// Отключить отладку
debugCookieConsent.disableDebug();
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
- **HTML санитизация**: Разрешены только безопасные теги (`a`, `strong`, `em`, `br`, `p`)
- **CSP заголовки**: Автоматическое добавление Content Security Policy
- **CSRF токены**: Защита от межсайтовой подделки запросов

## Совместимость

- **Браузеры**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Фреймворки**: Vanilla JS, React, Vue, Angular
- **Устройства**: Desktop, Tablet, Mobile

## Структура проекта

```
cookie-consent-hub/
├── js/
│   ├── cookie-consent.js        # Основной класс
│   ├── cookie-consent-config.js # Конфигурация
│   └── index.js                 # Точка входа
├── css/
│   └── main.min.css            # Стили (создайте из SASS)
└── index.html                  # Демо страница
```

## Настройка перед использованием

1. **Замените GTM ID** в `cookie-consent-config.js`:
```javascript
gtm: {
    enabled: true,
    id: 'GTM-ВАШТАМ',  // Замените на ваш ID
}
```

2. **Включите нужные категории** в `cookie-consent-config.js`:
```javascript
// Раскомментируйте marketing и functional если нужны
```

3. **Создайте CSS файл** из SASS исходников или напишите собственные стили

4. **Настройте пути к скриптам** в категориях cookie

## Лицензия

MIT License - подробности в файле [LICENSE](LICENSE).

## Благодарности

- [GDPR](https://gdpr.eu/) - Общий регламент по защите данных
- [152-ФЗ](http://www.consultant.ru/document/cons_doc_LAW_61801/) - Федеральный закон о персональных данных