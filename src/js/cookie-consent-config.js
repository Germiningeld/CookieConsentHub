/**
 * Конфигурация для CookieConsent
 * @version 2.0.0
 */

export const cookieConsentConfig = {
    // Основные настройки
    core: {
        simpleMode: false,                     // Простой режим (true/false)
        debugMode: false,                      // Режим отладки
        autoInit: true,                        // Автоматическая инициализация при загрузке DOM

        testMode: true,                      // Режим тестирования (без показа баннеров)
        testModeConsent: {                    // Настройки согласия для тестового режима
            analytics: true,                  // Включить аналитику в тестовом режиме
            necessary: true,                  // Необходимые куки всегда включены
            marketing: false,                 // Маркетинговые куки выключены
            functional: false                 // Функциональные куки выключены
        },
        consentExpiration: 30 * 24 * 60 * 60 * 1000 // Срок действия согласия в миллисекундах (30 дней)
    },
    styles: {
        autoLoadCSS: true,                    // Включить/выключить автозагрузку CSS
        cssFiles: [                           // Список файлов для загрузки
            '/assets/cookie_consent/css/main.min.css',        // Основные стили
        ]
    },

    // Настройки Content Security Policy
    security: {
        enableCSP: false,                            // Включить автоматическое добавление CSP заголовков
        csp: {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://mc.yandex.ru",             // Яндекс.Метрика
                "https://yandex.ru",
                "https://yastatic.net",
                "https://widget.yourgood.app",
                "https://cdn.callibri.ru"                // Дополнительные скрипты Яндекс
            ],
            'connect-src': [
                "'self'",
                "https://mc.yandex.ru",              // AJAX запросы Яндекс.Метрики
                "https://yastatic.net",
                "https://widget.yourgood.app",
                "https://cdn.callibri.ru"
            ],
            'img-src': [
                "'self'",
                "data:",
                "https:"
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'"
            ]
        }
    },

    // Типы модальных окон
    modalTypes: {
        INITIAL: 'initial',                    // Первоначальное окно
        MANUAL_SETTINGS: 'manualSettings',     // Настройки по кнопке
        EXPERIENCE_IMPROVE: 'experienceImprove', // Улучшите свой опыт
        SIMPLE_NOTIFICATION: 'simpleNotification' // Простое уведомление о cookie
    },

    // Настройки визуальных эффектов
    visual: {
        // Настройки оверлея
        overlay: {
            blur: '0',                         // Значение размытия для оверлея
            color: 'rgba(0, 0, 0, 0.3)',       // Цвет оверлея
            zIndex: 9998                       // z-index оверлея
        },

        // Настройки модального окна
        modal: {
            zIndex: 9999,                      // z-index модального окна
            allowClose: true,                  // Разрешить закрытие модального окна
            maxWidth: '500px',                 // Максимальная ширина для центрированных окон
            borderRadius: '12px',              // Скругление углов
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' // Тень модального окна
        },

        // Настройки для каждого типа модального окна
        modalTypes: {
            // Начальное окно с выбором разрешений
            initial: {
                position: 'center',            // Позиция окна: center - по центру экрана
                maxWidth: '500px',             // Максимальная ширина (для center)
                showOverlay: true,             // Показывать затемнение фона
                allowClose: true,              // Разрешить закрытие окна через крестик
                closeOnOverlayClick: true,     // Закрывать при клике на затемнение
                animation: 'fade',             // Тип анимации: fade - плавное появление
                preventScroll: true,           // Блокировать прокрутку страницы
                showExperienceImprove: true    // Показывать баннер улучшения опыта после выбора
            },

            // Окно настроек (открывается по кнопке)
            manualSettings: {
                position: 'center',            // Позиция окна: center - по центру экрана
                maxWidth: '500px',             // Максимальная ширина (для center)
                showOverlay: true,             // Показывать затемнение фона
                allowClose: true,              // Разрешить закрытие окна через крестик
                closeOnOverlayClick: true,     // Закрывать при клике на затемнение
                animation: 'fade',             // Тип анимации: fade - плавное появление
                preventScroll: true,           // Блокировать прокрутку страницы
                showExperienceImprove: true    // Показывать баннер улучшения опыта после выбора
            },

            // Баннер "Улучшите свой опыт"
            experienceImprove: {
                position: 'center',            // Позиция окна: center - по центру экрана
                maxWidth: '400px',             // Максимальная ширина (для center)
                showOverlay: false,            // Не показывать затемнение фона
                allowClose: true,              // Разрешить закрытие окна через крестик
                closeOnOverlayClick: false,    // Не закрывать при клике вне окна
                animation: 'slide',            // Тип анимации: slide - выезжает сверху
                preventScroll: false,          // Не блокировать прокрутку страницы
                showExperienceImprove: false   // Не показывать повторно этот баннер
            },

            // Простое уведомление о cookie (для simpleMode)
            simpleNotification: {
                position: 'bottom',            // Позиция окна: bottom - прикреплено к низу экрана
                maxWidth: '100%',              // Максимальная ширина (для bottom/top позиций)
                padding: '20px',               // Отступы по краям экрана
                showOverlay: false,            // Не показывать затемнение фона
                allowClose: false,             // Не разрешать закрытие через крестик
                closeOnOverlayClick: false,    // Не закрывать при клике вне окна
                animation: 'slide',            // Тип анимации: slide - выезжает снизу
                preventScroll: false,          // Не блокировать прокрутку страницы
                showExperienceImprove: false   // Не показывать баннер улучшения опыта
            }
        }
    },

    // Настройки интеграции с системами управления тегами
    tagManagers: {
        gtm: {
            enabled: true,
            id: 'GTM-5S7NM4HM',
            events: {
                consent: 'cookieConsent',       // Основное событие согласия
                settings: 'cookieSettings'      // Событие открытия настроек
            },
            dataLayer: 'dataLayer'
        },
        matomo: {
            enabled: true,                      // Включаем Matomo Tag Manager
            events: {
                consent: 'cookieConsent',       // Событие согласия
                settings: 'cookieSettings'      // Событие открытия настроек
            }
        }
    },

    // Настройки категорий cookie
    categories: {
        necessary: {
            title: 'Необходимые',
            description: 'Эти файлы cookie необходимы для работы сайта и не могут быть отключены. Они обычно устанавливаются только в ответ на ваши действия.',
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
            description: 'Эти файлы cookie помогают нам улучшать наш сайт, собирая информацию о его использовании. Все данные анонимизированы.',
            required: false,
            cookiePrefixes: [
                '_ym_',    // Яндекс.Метрика
                '_ga',     // Google Analytics
                '_gid',    // Google Analytics
                '_gat',    // Google Analytics
                '_pk_',    // Matomo Analytics
                'mtm_'     // Matomo Tag Manager
            ],
            cookiesToRemove: [
                'mtm_consent',         // Matomo Tag Manager consent cookie
                'mtm_consent_removed'  // Matomo Tag Manager consent removed cookie
            ],
            scripts: [
                {
                    type: 'inline',
                    code: 'console.log("testEvent отправлен");'
                },
                {
                    type: 'event',
                    name: 'testEvent'                    // Тестовое событие для MTM
                }
            ]
        },
        // marketing: {
        //     title: 'Маркетинг',
        //     description: 'Эти файлы cookie используются для отслеживания посетителей на веб-сайтах с целью показа релевантной рекламы.',
        //     required: false,
        //     cookiePrefixes: [
        //         '_fbp',    // Facebook Pixel
        //         '_fbc',    // Facebook Click ID
        //         '_ym_metrika',  // Яндекс.Метрика (рекламные)
        //         'yaAdvId'  // Яндекс.Директ
        //     ],
        //     scripts: [
        //         {
        //             type: 'file',
        //             path: '/js/scripts/marketing.js'
        //         }
        //     ]
        // },
        // functional: {
        //     title: 'Функциональные',
        //     description: 'Эти файлы cookie позволяют веб-сайту предоставлять расширенную функциональность и персонализацию.',
        //     required: false,
        //     scripts: [
        //         {
        //             type: 'file',
        //             path: '/js/scripts/functional.js'
        //         }
        //     ]
        // }
    },

    // Тексты для интерфейса
    texts: {
        mainBanner: {
            title: 'Настройки файлов cookie',
            description: 'Мы используем файлы cookie для улучшения вашего опыта на нашем сайте.\nПожалуйста, выберите, какие файлы cookie вы хотите принять.',
            acceptAll: 'Принять все',
            acceptNecessary: 'Только необходимые',
            settings: 'Настроить предпочтения'
        },
        experienceImprove: {
            title: 'Улучшите свой опыт',
            description: 'Вы можете улучшить свой опыт на сайте, разрешив использование дополнительных файлов cookie. Это поможет нам сделать сайт более удобным и персонализированным.',
            acceptAll: 'Принять все',
            keepChoice: 'Оставить текущий выбор'
        },
        settings: {
            title: 'Настройки cookie',
            description: 'Выберите, какие файлы cookie вы хотите разрешить на этом сайте. Вы можете изменить эти настройки в любое время.',
            acceptAll: 'Принять все',
            acceptSelected: 'Сохранить выбор'
        },
        simpleNotification: {
            title: 'На сайте используются файлы куки',
            description: 'Мы используем куки, чтобы понимать, как вы пользуетесь нашим магазином, и улучшать ваш опыт покупок.\nОставаясь с нами, вы соглашаетесь на это. <a href="#" class="cookie-consent__link">Подробнее</a>',
            acceptButton: 'OK'
        }
    }
};