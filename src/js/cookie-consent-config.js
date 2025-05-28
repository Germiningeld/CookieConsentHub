/**
 * Конфигурация для CookieConsent
 * @version 2.0.0
 */

export const cookieConsentConfig = {
    // Основные настройки
    core: {
        simpleMode: false,                     // Простой режим (true/false)
        debugMode: true,                      // Режим отладки
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
            '/css/main.min.css',        // Основные стили
        ]
    },

    // Настройки Content Security Policy
    security: {
        enableCSP: true,                            // Включить автоматическое добавление CSP заголовков
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
            maxWidth: '500px',                 // Максимальная ширина модального окна
            borderRadius: '12px',              // Скругление углов
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' // Тень модального окна
        },

        // Настройки для каждого типа модального окна
        modalTypes: {
            initial: {
                position: 'center',            // Позиция: center, top, bottom
                maxWidth: '500px',             // Максимальная ширина
                showOverlay: true,             // Показывать затемнение фона
                allowClose: true,              // Разрешить закрытие окна
                closeOnOverlayClick: true,     // Закрывать при клике на затемнение
                animation: 'fade',             // Тип анимации: fade, slide, none
                preventScroll: true,           // Блокировать прокрутку страницы
                showExperienceImprove: true    // Показывать баннер улучшения опыта
            },
            manualSettings: {
                position: 'center',
                maxWidth: '500px',
                showOverlay: true,
                allowClose: true,
                closeOnOverlayClick: true,
                animation: 'fade',
                preventScroll: true,
                showExperienceImprove: true
            },
            experienceImprove: {
                position: 'center',
                maxWidth: '400px',
                showOverlay: false,            // Не показывать затемнение для баннера
                allowClose: true,
                closeOnOverlayClick: false,
                animation: 'slide',
                preventScroll: false,          // Не блокировать прокрутку для баннера
                showExperienceImprove: false   // Это сам баннер
            },
            simpleNotification: {
                position: 'bottom',
                maxWidth: '500px',
                showOverlay: false,
                allowClose: false,             // Не разрешать закрытие
                closeOnOverlayClick: false,
                animation: 'slide',
                preventScroll: false,
                showExperienceImprove: false
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
            enabled: false,
            siteId: null,
            trackerUrl: null
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
            scripts: [
                {
                    type: 'file',
                    path: '/js/scripts/analytics.js'
                },
                // {
                //     type: 'gtm',
                //     name: 'loadAnalytics',
                //     data: {
                //         source: 'cookie-consent',
                //         category: 'analytics'
                //     }
                // }
            ]
        },
        // marketing: {
        //     title: 'Маркетинг',
        //     description: 'Эти файлы cookie используются для отслеживания посетителей на веб-сайтах с целью показа релевантной рекламы.',
        //     required: false,
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