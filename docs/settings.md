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

- Автоматически принимает все согласия при инициализации
- Загружает все скрипты сразу
- Показывает только информационное уведомление (`simpleNotification`)
- Пользователь должен нажать "OK" чтобы закрыть уведомление

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
            allowClose: false,           // Нельзя закрыть крестиком
            closeOnOverlayClick: false,
            animation: 'slide',
            preventScroll: false,
            showExperienceImprove: false
        }
    }
}
```

## Настройки категорий cookie

### Активные категории (по умолчанию)

В текущей конфигурации активны только две категории:

```javascript
categories: {
    necessary: {
        title: 'Необходимые',
        description: 'Эти файлы cookie необходимы для работы сайта и не могут быть отключены.',
        required: true,              // Обязательная категория
        scripts: [
            {
                type: 'file',
                path: '/js/scripts/necessary.js'
            }
        ]
    },
    analytics: {
        title: 'Аналитика',
        description: 'Эти файлы cookie помогают нам улучшать наш сайт, собирая информацию о его использовании. Все данные анонимизированы.',
        required: false,
        scripts: [
            {
                type: 'event',
                name: 'loadAnalytics',
                data: {
                    source: 'cookie-consent',
                    category: 'analytics'
                }
            }
        ]
    }
}

// ОТКЛЮЧЕННЫЕ КАТЕГОРИИ (закомментированы в конфигурации):
// - marketing: Маркетинговые cookie
// - functional: Функциональные cookie
// 
// Чтобы активировать их, раскомментируйте соответствующие блоки
// в файле cookie-consent-config.js
```

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
    },
    functional: {
        title: 'Функциональные',
        description: 'Позволяют сайту запоминать сделанные вами выборы.',
        required: false,
        scripts: [
            {
                type: 'event',
                name: 'loadFunctional',
                data: { category: 'functional' }
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
        description: 'Это чтобы сайт работал лучше.\nОставаясь с нами, вы соглашаетесь на использование файлов куки. <a href="#" class="cookie-consent__link">Подробнее</a>',
        acceptButton: 'OK'
    }
}
```

## Интеграция с системами аналитики

### Google Tag Manager (активен)

```javascript
tagManagers: {
    gtm: {
        enabled: true,
        id: 'GTM-5S7NM4HM',           // ЗАМЕНИТЕ на ваш GTM ID
        events: {
            consent: 'cookieConsent',  // Событие изменения согласия
            settings: 'cookieSettings' // Событие открытия настроек
        },
        dataLayer: 'dataLayer'       // Имя dataLayer
    }
}
```

**⚠️ Важно**: Замените `GTM-5S7NM4HM` на ваш реальный GTM ID перед использованием в продакшене.

### Matomo (не активен)

```javascript
tagManagers: {
    matomo: {
        enabled: false,              // Отключен по умолчанию
        siteId: null,                // Установите ID сайта для активации
        trackerUrl: null             // Установите URL трекера для активации
    }
}
```

**Для активации Matomo**:
1. Установите `enabled: true`
2. Укажите `siteId` и `trackerUrl`
3. Убедитесь что на странице подключен Matomo трекинг код

## Настройки внешнего вида

### Оверлей

```javascript
visual: {
    overlay: {
        blur: '0',                   // Размытие фона (по умолчанию отключено)
        color: 'rgba(0, 0, 0, 0.3)', // Цвет затемнения
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

### Статические методы (работают)

```javascript
// Инициализация
const consent = CookieConsent.init(options);

// Проверка согласия
CookieConsent.hasConsent('analytics'); // true/false

// Получение всех согласий
CookieConsent.getConsent(); // { necessary: true, analytics: false, ... }

// Показать/скрыть модальное окно
CookieConsent.show();
CookieConsent.hide();
```

### Методы экземпляра (правильные способы вызова)

```javascript
// ✅ Через глобальный объект (рекомендуется)
window.cookieConsent.openSettings();

// ✅ Через экземпляр (если есть доступ)
if (CookieConsent.instance) {
    CookieConsent.instance._openSettings();
}

// ✅ Через отладочные функции
debugCookieConsent.openSettings();

// ❌ НЕ РАБОТАЕТ (метод не существует)
// CookieConsent.openSettings();
```

### Глобальный API объект

```javascript
// Доступен как window.cookieConsent
window.cookieConsent = {
    init: (options) => CookieConsent.init(options),
    hasConsent: (category) => CookieConsent.hasConsent(category),
    getConsent: () => CookieConsent.getConsent(),
    openSettings: () => CookieConsent.openSettings(),  // Работает корректно
    show: () => CookieConsent.show(),
    hide: () => CookieConsent.hide()
};
```

### События браузера

```javascript
// Изменение согласия
window.addEventListener('cookieConsent', (event) => {
    console.log('Consent changed:', event.detail);
});

// Кастомные события из скриптов
window.addEventListener('cookieConsent:loadAnalytics', (event) => {
    console.log('Analytics event triggered:', event.detail);
});
```

## Отладка и диагностика

### Включение отладки

```javascript
// Способ 1: Прямо в коде
window.__COOKIE_CONSENT_DEBUG__ = true;

// Способ 2: Через функцию отладки
debugCookieConsent.enableDebug();

// Отключение отладки
debugCookieConsent.disableDebug();
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

// Управление режимом отладки
debugCookieConsent.enableDebug();
debugCookieConsent.disableDebug();
```

### Логирование

При включенной отладке в консоли будут отображаться подробные логи:

```javascript
// Примеры логов
[CookieConsent] Initializing CookieConsent
[CookieConsent] Retrieved saved consent: {...}
[CookieConsent] Valid consent found, loading scripts
[CookieConsent] Opening settings
[CookieConsent] Accept all clicked - hiding modal
[CookieConsent] GTM event sent: cookieConsent {...}
```

## CSS переменные для кастомизации

```css
:root {
  /* Оверлей */
  --cookie-consent-overlay-color: rgba(0, 0, 0, 0.3);
  --cookie-consent-blur: 0;
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

/* Позиционирование */
.cookie-consent--top {
  top: 20px;
}

.cookie-consent--bottom {
  bottom: 20px;
}

/* Анимации */
.cookie-consent--fade {
  transition: opacity 0.3s ease;
}

.cookie-consent--slide {
  transition: transform 0.3s ease;
}
```

## Хранение данных

### Формат данных в localStorage

```javascript
// Ключ: 'cookieConsent'
{
    "is_cookies_accepted": 1,
    "timestamp": 1703686800000,
    "necessary": true,
    "analytics": false
    // marketing и functional будут добавлены если категории активированы
}

// Ключ: 'cookieConsentCsrf' 
"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" // CSRF токен
```

### Срок действия

- Согласие действует **24 часа** с момента сохранения
- После истечения срока пользователю снова показывается баннер
- Проверка срока происходит при каждой инициализации

### Очистка cookie

Система автоматически удаляет неавторизованные cookie при изменении согласия:

```javascript
// Список cookie, требующих согласия (из реализации)
const consentRequiredCookies = {
    analytics: ['_ym_uid', '_ym_d', '_ga', '_gid', '_gat'],
    marketing: ['_fbp', '_fbc'],
    functional: ['PHPSESSID'] // если используется для функций, требующих согласия
};
```

## Безопасность

### Встроенные механизмы

1. **XSS защита**: Все пользовательские данные экранируются через `_escapeHtml()`
2. **HTML санитизация**: В `_sanitizeHtml()` разрешены только безопасные теги
3. **CSP заголовки**: Автоматически добавляются через `_addSecurityHeaders()`
4. **CSRF токены**: Генерируются и сохраняются для защиты от подделок

### Разрешенные HTML теги

```javascript
// В описаниях можно использовать только эти теги:
const allowedTags = ['a', 'strong', 'em', 'br', 'p'];
const allowedAttributes = {
    'a': ['href', 'class', 'target', 'rel']
};
```

### Content Security Policy

Автоматически добавляемые CSP правила включают разрешения для:
- Google Tag Manager
- Google Analytics  
- Matomo (если активен)

## Миграция и обновления

### Подготовка к использованию

1. **Обновите GTM ID**:
```javascript
// В cookie-consent-config.js
gtm: {
    enabled: true,
    id: 'GTM-ВАШТАМ',  // Замените на реальный
}
```

2. **Активируйте нужные категории**:
```javascript
// Раскомментируйте в cookie-consent-config.js
// marketing: { ... },
// functional: { ... }
```

3. **Настройте пути к скриптам**:
```javascript
scripts: [
    {
        type: 'file',
        path: '/js/your-actual-script.js'  // Реальные пути
    }
]
```

4. **Создайте CSS файл** из SASS исходников или напишите собственные стили

### Проверка работоспособности

```javascript
// После инициализации проверьте:
console.log('Instance:', CookieConsent.instance);
console.log('Config:', CookieConsent.instance?.config);
console.log('Consent:', CookieConsent.getConsent());

// Проверьте элементы DOM:
debugCookieConsent.checkModal();
debugCookieConsent.checkOverlay();
```