export const cookieConsentConfig = {
    // Типы модальных окон
    modalTypes: {
        INITIAL: 'initial',           // Первоначальное окно
        FIRST_VISIT_SETTINGS: 'firstVisitSettings', // Настройка при первичном посещении
        EXPERIENCE_IMPROVE: 'experienceImprove',    // Улучшите свой опыт
        MANUAL_SETTINGS: 'manualSettings',          // Настройки по кнопке
        SIMPLE_NOTIFICATION: 'simpleNotification'   // Простое уведомление о cookie
    },

    // Настройки визуальных эффектов
    visual: {
        // Настройки оверлея
        overlay: {
            blur: '0',              // Значение размытия для оверлея
            color: 'rgba(0, 0, 0, 0.3)', // Цвет оверлея
            zIndex: 9998             // z-index оверлея
        },
        // Настройки модального окна
        modal: {
            zIndex: 9999,            // z-index модального окна
            allowClose: true,        // Разрешить закрытие модального окна
            maxWidth: '500px',       // Максимальная ширина модального окна
            borderRadius: '12px',    // Скругление углов
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' // Тень модального окна
        },
        // Настройки для каждого типа модального окна
        modalTypes: {
            initial: {
                position: 'center',    // Позиция модального окна: center (центр), top (верх), bottom (низ)
                maxWidth: '500px',     // Максимальная ширина модального окна
                showOverlay: true,    // Показывать затемнение фона
                allowClose: true,      // Разрешить закрытие окна
                closeOnOverlayClick: true, // Закрывать при клике на затемнение
                animation: 'fade',     // Тип анимации: fade (плавное появление), slide (слайд), none (без анимации)
                preventScroll: true,  // Блокировать прокрутку страницы
                showExperienceImprove: true // Показывать баннер улучшения опыта после выбора настроек
            },
            firstVisitSettings: {
                position: 'center',    // Позиция модального окна
                maxWidth: '500px',     // Максимальная ширина
                showOverlay: true,     // Показывать затемнение фона
                allowClose: true,      // Разрешить закрытие
                closeOnOverlayClick: true, // Закрывать при клике на затемнение
                animation: 'fade',     // Тип анимации
                preventScroll: true,   // Блокировать прокрутку страницы
                showExperienceImprove: true // Показывать баннер улучшения опыта после выбора настроек
            },
            experienceImprove: {
                position: 'center',    // Позиция модального окна (только top или bottom)
                maxWidth: '400px',     // Уменьшенная максимальная ширина для баннера
                showOverlay: false,    // Не показывать затемнение для баннера
                allowClose: true,      // Разрешить закрытие
                closeOnOverlayClick: true, // Закрывать при клике на затемнение
                animation: 'slide',    // Анимация появления снизу
                preventScroll: false,  // Не блокировать прокрутку для баннера
                showExperienceImprove: false // Не показывать баннер улучшения опыта (это сам баннер)
            },
            manualSettings: {
                position: 'center',    // Позиция модального окна
                maxWidth: '500px',     // Максимальная ширина
                showOverlay: true,     // Показывать затемнение фона
                allowClose: true,      // Разрешить закрытие
                closeOnOverlayClick: true, // Закрывать при клике на затемнение
                animation: 'fade',     // Тип анимации
                preventScroll: true,   // Блокировать прокрутку страницы
                showExperienceImprove: true // Показывать баннер улучшения опыта после выбора настроек
            },
            simpleNotification: {
                position: 'bottom',    // Позиция модального окна
                maxWidth: '500px',     // Максимальная ширина
                showOverlay: false,    // Не показывать затемнение
                allowClose: false,      // Не разрешать закрытие
                closeOnOverlayClick: false, // Не закрывать при клике на затемнение
                animation: 'slide',    // Анимация появления снизу
                preventScroll: false,  // Не блокировать прокрутку
                showExperienceImprove: false // Не показывать баннер улучшения опыта
            }
        }
    },

    // Настройки интеграции с системами управления тегами
    tagManagers: {
        gtm: {
            enabled: true,
            id: 'GTM-5S7NM4HM',
            events: {
                consent: 'cookieConsent'           // Основное событие согласия
            },
            dataLayer: 'dataLayer'
        },
        matomo: false  // Использовать Matomo Tag Manager
    },

    // Настройки категорий
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
            description: 'Эти файлы cookie помогают нам улучшать наш сайт, собирая информацию о его использовании.',
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
                //         source: 'analytics.js',
                //         category: 'analytics'
                //     }
                // }
            ]
        },
        // marketing: {
        //     title: 'Маркетинг',
        //     description: 'Эти файлы cookie используются для отслеживания посетителей на веб-сайтах. Намерение состоит в том, чтобы показывать релевантную рекламу.',
        //     required: false,
        //     scripts: [
        //         {
        //             type: 'file',
        //             path: 'marketing.js'  // Относительный путь от baseUrl
        //         },
        //         {
        //             type: 'event',
        //             name: 'loadMarketing',
        //             data: {
        //                 source: 'cookie-consent',
        //                 category: 'marketing',
        //                 timestamp: new Date().toISOString()
        //             }
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
        //             path: 'functional.js'  // Относительный путь от baseUrl
        //         },
        //         {
        //             type: 'event',
        //             name: 'loadFunctional',
        //             data: {
        //                 source: 'cookie-consent',
        //                 category: 'functional',
        //                 timestamp: new Date().toISOString()
        //             }
        //         }
        //     ]
        // }
    },

    // Тексты для баннеров
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
            description: 'Выберите, какие файлы cookie вы хотите разрешить на этом сайте.',
            acceptAll: 'Принять все',
            acceptSelected: 'Сохранить выбор'
        },
        simpleNotification: {
            title: 'Используем куки и рекомендательные технологии',
            description: 'Это чтобы сайт работал лучше.\nОставаясь с нами, вы соглашаетесь на использование файлов куки. <a href="#" class="cookie-consent__link">А ещё</a>',
            acceptButton: 'OK'
        }
    }
}; 