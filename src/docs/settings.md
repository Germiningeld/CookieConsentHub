# Настройки Cookie Consent Hub v2.0

## Основная инициализация

```javascript
// Простая инициализация
const cookieConsent = CookieConsent.init();

// С кастомными настройками
const cookieConsent = CookieConsent.init({
    simpleMode: false,
    visual: { /* настройки */ },
    categories: { /* категории */ },
    texts: { /* тексты */ },
    tagManagers: { /* интеграции */ }
});
```

## Режимы работы

### Обычный режим (по умолчанию)

```javascript
CookieConsent.init({
    simpleMode: false
});
```

- Показывает полноценные модальные окна
- Требует явного согласия пользователя
- Поддерживает все типы модальных окон

### Простой режим

```javascript
CookieConsent.init({
    simpleMode: true
});
```

- Автоматически принимает все согласия
- Показывает только информационное уведомление
- Загружает все скрипты сразу

## Типы модальных окон

### INITIAL - Начальное окно согласия

```javascript
modalTypes: {
    INITIAL: 'initial'
}

visual: {
    modalTypes: {
        initial: {
            position: 'center',          // center, top, bottom
            maxWidth: '500px',           
            showOverlay: true,           // Показывать затемнение
            allowClose: true,            // Разрешить закрытие
            closeOnOverlayClick: true,   // Закрывать по клику на оверлей
            animation: 'fade',           // fade, slide, none
            preventScroll: true,         // Блокировать скролл
            showExperienceImprove: true  // Показывать баннер улучшения
        }
    }
}
```

### MANUAL_SETTINGS - Настройки по требованию

```javascript
modalTypes: {
    MANUAL_SETTINGS: 'manualSettings'
}

visual: {
    modalTypes: {
        manualSettings: {
            position: 'center',
            maxWidth: '500px',
            showOverlay: true,
            allowClose: true,
            closeOnOverlayClick: true,
            animation: 'fade',
            preventScroll: true,
            showExperienceImprove: true  // Показывать после выбора минимальных
        }
    }
}
```

### EXPERIENCE_IMPROVE - Улучшение опыта

```javascript
modalTypes: {
    EXPERIENCE_IMPROVE: 'experienceImprove'
}

visual: {
    modalTypes: {
        experienceImprove: {
            position: 'center',          // Обычно center или bottom
            maxWidth: '400px',           // Меньше чем основные модальные окна
            showOverlay: false,          // Обычно без затемнения
            allowClose: true,
            closeOnOverlayClick: false,
            animation: 'slide',
            preventScroll: false,        // Не блокировать скролл
            showExperienceImprove: false // Это сам баннер улучшения
        }
    }
}
```

### SIMPLE_NOTIFICATION - Простое уведомление

```javascript
modalTypes: {
    SIMPLE_NOTIFICATION: 'simpleNotification'
}

visual: {
    modalTypes: {
        simpleNotification: {
            position: 'bottom',          // Обычно в нижней части
            maxWidth: '500px',
            showOverlay: false,          // Без затемнения
            allowClose: false,           // Нельзя закрыть
            closeOnOverlayClick: false,
            animation: 'slide',
            preventScroll: false,
            showExperienceImprove: false
        }
    }
}
```

## Настройки категорий cookie

### Структура категории

```javascript
categories: {
    categoryName: {
        title: 'Название категории',
        description: 'Описание категории.\nМожет содержать переносы строк.',
        required: false,              // true для обязательных категорий
        scripts: [
            // Массив скриптов для загрузки
        ]
    }
}
```

### Типы скриптов

#### Файловые скрипты

```javascript
{
    type: 'file',
    path: '/js/analytics.js'         // Относительный или абсолютный путь
}

// Или с полным URL
{
    type: 'file',
    path: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
}
```

#### Встроенные скрипты

```javascript
{
    type: 'inline',
    code: `
        console.log('Script loaded');
        // Ваш JavaScript код
    `
}
```

#### События GTM

```javascript
{
    type: 'gtm',
    name: 'loadAnalytics',
    data: {
        category: 'analytics',
        source: 'cookie-consent'
    }
}
```

#### Кастомные события

```javascript
{
    type: 'event',
    name: 'customAnalyticsEvent',
    data: {
        provider: 'google',
        category: 'analytics'
    }
}
```

### Пример полной конфигурации категорий

```javascript
categories: {
    necessary: {
        title: 'Необходимые',
        description: 'Эти файлы cookie необходимы для работы сайта и не могут быть отключены.',
        required: true,
        scripts: [
            {
                type: 'file',
                path: '/js/scripts/necessary.js'
            }
        ]
    },
    analytics: {
        title: 'Аналитика',
        description: 'Эти файлы cookie помогают нам улучшать наш сайт, собирая анонимную информацию о его использовании.',
        required: false,
        scripts: [
            {
                type: 'file',
                path: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
            },
            {
                type: 'inline',
                code: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'GA_MEASUREMENT_ID');
                `
            },
            {
                type: 'event',
                name: 'analyticsLoaded',
                data: { category: 'analytics' }
            }
        ]
    },
    marketing: {
        title: 'Маркетинг',
        description: 'Используются для отслеживания посетителей на веб-сайтах с целью показа релевантной рекламы.',
        required: false,
        scripts: [
            {
                type: 'file',
                path: '/js/scripts/facebook-pixel.js'
            },
            {
                type: 'gtm',
                name: 'loadMarketing',
                data: { category: 'marketing' }
            }
        ]
    }
}
```

## Настройки текстов

### Основной баннер

```javascript
texts: {
    mainBanner: {
        title: 'Настройки файлов cookie',
        description: 'Мы используем файлы cookie для улучшения вашего опыта на нашем сайте.\nПожалуйста, выберите, какие файлы cookie вы хотите принять.',
        acceptAll: 'Принять все',
        acceptNecessary: 'Только необходимые',
        settings: 'Настроить предпочтения'
    }
}
```

### Баннер улучшения опыта

```javascript
texts: {
    experienceImprove: {
        title: 'Улучшите свой опыт',
        description: 'Вы можете улучшить свой опыт на сайте, разрешив использование дополнительных файлов cookie. Это поможет нам сделать сайт более удобным и персонализированным.',
        acceptAll: 'Принять все',
        keepChoice: 'Оставить текущий выбор'
    }
}
```

### Настройки

```javascript
texts: {
    settings: {
        title: 'Настройки cookie',
        description: 'Выберите, какие файлы cookie вы хотите разрешить на этом сайте. Вы можете изменить эти настройки в любое время.',
        acceptAll: 'Принять все',
        acceptSelected: 'Сохранить выбор'
    }
}
```

### Простое уведомление

```javascript
texts: {
    simpleNotification: {
        title: 'Используем куки и рекомендательные технологии',
        description: 'Это чтобы сайт работал лучше.\nОставаясь с нами, вы соглашаетесь на использование файлов куки. <a href="/privacy" class="cookie-consent__link">Подробнее</a>',
        acceptButton: 'OK'
    }
}
```

## Интеграция с системами аналитики

### Google Tag Manager

```javascript
tagManagers: {
    gtm: {
        enabled: true,
        id: 'GTM-XXXXXXX',           // Ваш GTM ID
        events: {
            consent: 'cookieConsent',  // Событие изменения согласия
            settings: 'cookieSettings' // Событие открытия настроек
        },
        dataLayer: 'dataLayer'       // Имя dataLayer
    }
}
```

### Matomo

```javascript
tagManagers: {
    matomo: {
        enabled: true,
        siteId: '1',                 // ID сайта в Matomo
        trackerUrl: 'https://your-matomo.com/'
    }
}
```

## Настройки внешнего вида

### Оверлей

```javascript
visual: {
    overlay: {
        blur: '5px',                 // Размытие фона
        color: 'rgba(0, 0, 0, 0.5)', // Цвет затемнения
        zIndex: 9998                 // z-index оверлея
    }
}
```

### Модальное окно

```javascript
visual: {
    modal: {
        zIndex: 9999,                // z-index модального окна
        allowClose: true,            // Глобальная настройка закрытия
        maxWidth: '500px',           // Глобальная максимальная ширина
        borderRadius: '12px',        // Скругление углов
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' // Тень
    }
}
```

## API методы

### Статические методы

```javascript
// Инициализация
CookieConsent.init(options);

// Проверка согласия
CookieConsent.hasConsent('analytics'); // true/false

// Получение всех согласий
CookieConsent.getConsent(); // { necessary: true, analytics: false, ... }

// Управление модальным окном
CookieConsent.openSettings();
CookieConsent.show();
CookieConsent.hide();
```

### События браузера

```javascript
// Изменение согласия
window.addEventListener('cookieConsent', (event) => {
    console.log('Consent changed:', event.detail);
});

// Кастомные события из скриптов
window.addEventListener('cookieConsent:analyticsLoaded', (event) => {
    console.log('Analytics loaded:', event.detail);
});
```

## Отладка и диагностика

### Включение отладки

```javascript
// Включить режим отладки
window.__COOKIE_CONSENT_DEBUG__ = true;
```

### Функции отладки

```javascript
// Проверить состояние оверлея
debugCookieConsent.checkOverlay();

// Проверить состояние модального окна
debugCookieConsent.checkModal();

// Получить экземпляр
const instance = debugCookieConsent.getInstance();

// Управление модальным окном
debugCookieConsent.openSettings();
debugCookieConsent.testHide();

// Ручное управление оверлеем
debugCookieConsent.showOverlay();
debugCookieConsent.hideOverlay();
```

## CSS переменные для кастомизации

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

  /* Скроллбар модального окна */
  --cookie-consent-scrollbar-width: 6px;
}

/* Темная тема */
.cookie-consent--dark {
  background: #333333;
  color: #ffffff;
}
```

## Хранение данных

### Формат данных в localStorage

```javascript
{
    "is_cookies_accepted": 1,
    "timestamp": 1640995200000,
    "necessary": true,
    "analytics": false,
    "marketing": false,
    "functional": true
}
```

### Срок действия

- Согласие действует **24 часа**
- После истечения срока пользователю снова показывается баннер
- Данные автоматически удаляются при истечении срока

### Очистка cookie

Система автоматически удаляет неавторизованные cookie при изменении согласия:

```javascript
// Список cookie, требующих согласия
const consentRequiredCookies = {
    analytics: ['_ga', '_gid', '_gat', '_ym_uid', '_ym_d'],
    marketing: ['_fbp', '_fbc'],
    functional: ['PHPSESSID'] // если используется для функций, требующих согласия
};
```