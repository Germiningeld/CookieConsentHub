# Настройки Cookie Consent Hub

## Общие настройки (cookie)

```javascript
cookie: {
    name: 'cookie-consent',        // Имя cookie для хранения согласия
    expiration: 365,               // Срок действия в днях
    domain: '',                    // Домен для cookie (пусто = текущий домен)
    path: '/',                     // Путь для cookie
    sameSite: 'Lax',              // Политика SameSite (Strict, Lax, None)
    secure: false                  // Использовать secure флаг
}
```

## Настройки модальных окон

### Общие настройки для всех модальных окон

```javascript
modals: {
    // Настройки оверлея
    overlay: {
        show: true,                // Показывать оверлей
        blur: 5,                   // Значение размытия в пикселях
        color: 'rgba(0, 0, 0, 0.5)' // Цвет оверлея
    },

    // Общие настройки для всех модальных окон
    common: {
        zIndex: 9999,              // z-index модального окна
        overlayZIndex: 9998,       // z-index оверлея
        maxWidth: '500px',         // Максимальная ширина
        borderRadius: '12px',      // Скругление углов
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)', // Тень
        animation: 'fade',         // Тип анимации (fade, slide)
        allowClose: true,          // Разрешить закрытие
        preventScroll: true        // Блокировать скролл
    }
}
```

### Настройки для каждого типа модального окна

#### INITIAL (Начальное окно)

```javascript
initial: {
    position: 'center',           // Позиция (center, top, bottom)
    showOverlay: true,            // Показывать оверлей
    preventScroll: true,          // Блокировать скролл
    allowClose: false,            // Запретить закрытие
    title: 'Использование cookie', // Заголовок
    description: '...',           // Описание
    buttons: {
        acceptAll: {
            text: 'Принять все',   // Текст кнопки
            type: 'primary'        // Тип кнопки
        },
        settings: {
            text: 'Настроить',     // Текст кнопки
            type: 'secondary'      // Тип кнопки
        }
    }
}
```

#### FIRST_VISIT_SETTINGS (Настройки при первом посещении)

```javascript
firstVisitSettings: {
    position: 'center',           // Позиция
    showOverlay: true,            // Показывать оверлей
    preventScroll: true,          // Блокировать скролл
    allowClose: true,             // Разрешить закрытие
    title: 'Настройки cookie',    // Заголовок
    description: '...',           // Описание
    buttons: {
        save: {
            text: 'Сохранить',     // Текст кнопки
            type: 'primary'        // Тип кнопки
        },
        cancel: {
            text: 'Отмена',        // Текст кнопки
            type: 'secondary'      // Тип кнопки
        }
    }
}
```

#### EXPERIENCE_IMPROVE (Улучшение опыта)

```javascript
experienceImprove: {
    position: 'bottom',           // Позиция (top, bottom)
    showOverlay: false,           // Не показывать оверлей
    preventScroll: false,         // Не блокировать скролл
    allowClose: true,             // Разрешить закрытие
    title: 'Улучшение опыта',     // Заголовок
    description: '...',           // Описание
    buttons: {
        accept: {
            text: 'Принять',       // Текст кнопки
            type: 'primary'        // Тип кнопки
        },
        settings: {
            text: 'Настроить',     // Текст кнопки
            type: 'secondary'      // Тип кнопки
        }
    }
}
```

#### MANUAL_SETTINGS (Ручные настройки)

```javascript
manualSettings: {
    position: 'center',           // Позиция
    showOverlay: true,            // Показывать оверлей
    preventScroll: true,          // Блокировать скролл
    allowClose: true,             // Разрешить закрытие
    title: 'Настройки cookie',    // Заголовок
    description: '...',           // Описание
    buttons: {
        save: {
            text: 'Сохранить',     // Текст кнопки
            type: 'primary'        // Тип кнопки
        },
        cancel: {
            text: 'Отмена',        // Текст кнопки
            type: 'secondary'      // Тип кнопки
        }
    }
}
```

## Настройки категорий cookie

```javascript
categories: {
    necessary: {
        title: 'Необходимые',      // Название категории
        description: '...',        // Описание
        required: true,            // Обязательная категория
        enabled: true              // Включена по умолчанию
    },
    preferences: {
        title: 'Предпочтения',     // Название категории
        description: '...',        // Описание
        required: false,           // Не обязательная категория
        enabled: false             // Выключена по умолчанию
    },
    statistics: {
        title: 'Статистика',       // Название категории
        description: '...',        // Описание
        required: false,           // Не обязательная категория
        enabled: false             // Выключена по умолчанию
    },
    marketing: {
        title: 'Маркетинг',        // Название категории
        description: '...',        // Описание
        required: false,           // Не обязательная категория
        enabled: false             // Выключена по умолчанию
    }
}
```

## Настройки тем

```javascript
theme: {
    // Светлая тема (по умолчанию)
    light: {
        background: '#ffffff',     // Фон модального окна
        text: '#333333',          // Цвет текста
        title: '#2c3e50',         // Цвет заголовка
        description: '#666666',    // Цвет описания
        button: {
            primary: {
                background: '#007bff',  // Фон основной кнопки
                text: '#ffffff',        // Текст основной кнопки
                hover: '#0056b3'        // Цвет при наведении
            },
            secondary: {
                background: '#f5f5f5',   // Фон вторичной кнопки
                text: '#333333',        // Текст вторичной кнопки
                hover: '#e0e0e0'        // Цвет при наведении
            }
        },
        overlay: 'rgba(0, 0, 0, 0.5)'  // Цвет оверлея
    },

    // Темная тема
    dark: {
        background: '#333333',     // Фон модального окна
        text: '#ffffff',          // Цвет текста
        title: '#ffffff',         // Цвет заголовка
        description: '#cccccc',    // Цвет описания
        button: {
            primary: {
                background: '#007bff',  // Фон основной кнопки
                text: '#ffffff',        // Текст основной кнопки
                hover: '#0056b3'        // Цвет при наведении
            },
            secondary: {
                background: '#444444',   // Фон вторичной кнопки
                text: '#ffffff',        // Текст вторичной кнопки
                hover: '#555555'        // Цвет при наведении
            }
        },
        overlay: 'rgba(0, 0, 0, 0.7)'  // Цвет оверлея
    }
}
```

## CSS-переменные

```css
:root {
  /* Оверлей */
  --cookie-consent-overlay-color: rgba(0, 0, 0, 0.5);
  --cookie-consent-blur: 5px;

  /* z-index */
  --cookie-consent-z-index: 9999;
  --cookie-consent-overlay-z-index: 9998;

  /* Размеры и внешний вид */
  --cookie-consent-max-width: 500px;
  --cookie-consent-border-radius: 12px;
  --cookie-consent-box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  /* Скролл */
  --cookie-consent-scrollbar-width: 0px;
}
```
