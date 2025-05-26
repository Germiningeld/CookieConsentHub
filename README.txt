Cookie Consent Hub
=================

Библиотека для управления согласием на использование файлов cookie с гибкой настройкой и различными вариантами отображения.

Особенности
----------
- Поддержка различных типов модальных окон (центрированное, верхний баннер, нижний баннер)
- Гибкая настройка внешнего вида и поведения
- Поддержка темной темы
- Адаптивный дизайн
- Анимации появления/исчезновения
- Блокировка скролла при открытом модальном окне
- Поддержка различных категорий cookie
- Возможность закрытия модального окна
- Настраиваемый оверлей с эффектом размытия

Типы модальных окон
-----------------
1. INITIAL (initial) - Начальное модальное окно
   - Центрированное отображение
   - Полноэкранный оверлей
   - Блокировка скролла
   - Кнопки "Принять все" и "Настроить"

2. FIRST_VISIT_SETTINGS (firstVisitSettings) - Настройки при первом посещении
   - Центрированное отображение
   - Список категорий cookie
   - Кнопки "Сохранить" и "Отмена"

3. EXPERIENCE_IMPROVE (experienceImprove) - Улучшение опыта
   - Верхний или нижний баннер
   - Компактный дизайн
   - Кнопка закрытия
   - Кнопки "Принять" и "Настроить"

4. MANUAL_SETTINGS (manualSettings) - Ручные настройки
   - Центрированное отображение
   - Полный список категорий
   - Кнопки "Сохранить" и "Отмена"

Настройка
--------
Все настройки доступны в файле cookie-consent-config.js:

1. Общие настройки:
   - cookieName: имя cookie для хранения согласия
   - cookieExpiration: срок действия cookie (в днях)
   - cookieDomain: домен для cookie
   - cookiePath: путь для cookie
   - cookieSameSite: политика SameSite
   - cookieSecure: использование secure флага

2. Настройки модальных окон:
   - position: позиция ('center', 'top', 'bottom')
   - showOverlay: показывать оверлей
   - preventScroll: блокировать скролл
   - allowClose: разрешить закрытие
   - blur: значение размытия оверлея
   - overlayColor: цвет оверлея
   - maxWidth: максимальная ширина
   - borderRadius: скругление углов
   - boxShadow: тень

3. Настройки категорий:
   - necessary: обязательные cookie
   - preferences: предпочтения
   - statistics: статистика
   - marketing: маркетинг

4. Настройки тем:
   - light: светлая тема
   - dark: темная тема

Использование
-----------
1. Подключите необходимые файлы:
   ```html
   <link rel="stylesheet" href="css/cookie-consent.min.css">
   <script src="js/cookie-consent-config.js"></script>
   <script src="js/consent-notification.js"></script>
   ```

2. Инициализация:
   ```javascript
   const consentNotification = new ConsentNotification(cookieConsentConfig);
   consentNotification.init();
   ```

3. Открытие модального окна:
   ```javascript
   // Открыть начальное окно
   consentNotification.showModal(cookieConsentConfig.modalTypes.INITIAL);
   
   // Открыть настройки
   consentNotification.showModal(cookieConsentConfig.modalTypes.MANUAL_SETTINGS);
   ```

4. Обработка событий:
   ```javascript
   consentNotification.on('accept', (categories) => {
     console.log('Приняты категории:', categories);
   });
   
   consentNotification.on('reject', () => {
     console.log('Согласие отклонено');
   });
   ```

Стилизация
---------
Библиотека использует CSS-переменные для настройки внешнего вида:

```css
:root {
  --cookie-consent-overlay-color: rgba(0, 0, 0, 0.5);
  --cookie-consent-blur: 5px;
  --cookie-consent-z-index: 9999;
  --cookie-consent-overlay-z-index: 9998;
  --cookie-consent-max-width: 500px;
  --cookie-consent-border-radius: 12px;
  --cookie-consent-box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  --cookie-consent-scrollbar-width: 0px;
}
```

Поддержка браузеров
-----------------
- Chrome (последние 2 версии)
- Firefox (последние 2 версии)
- Safari (последние 2 версии)
- Edge (последние 2 версии)

Лицензия
-------
MIT License 