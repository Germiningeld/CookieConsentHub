export const cookieConsentConfig = {
    // Типы модальных окон
    modalTypes: {
        INITIAL: 'initial',           // Первоначальное окно
        FIRST_VISIT_SETTINGS: 'firstVisitSettings', // Настройка при первичном посещении
        EXPERIENCE_IMPROVE: 'experienceImprove',    // Улучшите свой опыт
        MANUAL_SETTINGS: 'manualSettings'           // Настройки по кнопке
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
                position: 'bottom',    // Позиция: center, top, bottom
                maxWidth: '500px',     // Максимальная ширина
                showOverlay: false,     // Показывать оверлей
                allowClose: true,      // Разрешить закрытие
                closeOnOverlayClick: true, // Закрывать при клике на оверлей
                animation: 'fade',     // Тип анимации: fade, slide, none
                preventScroll: false    // Блокировать скроллинг body
            },
            firstVisitSettings: {
                position: 'center',
                maxWidth: '500px',
                showOverlay: true,
                allowClose: true,
                closeOnOverlayClick: true,
                animation: 'fade',
                preventScroll: true
            },
            experienceImprove: {
                position: 'bottom',    // Показываем снизу
                maxWidth: '400px',     // Уменьшенная ширина
                showOverlay: false,    // Без оверлея
                allowClose: true,
                closeOnOverlayClick: true,
                animation: 'slide',    // Анимация появления снизу
                preventScroll: false   // Не блокируем скроллинг для нижнего баннера
            },
            manualSettings: {
                position: 'center',
                maxWidth: '500px',
                showOverlay: true,
                allowClose: true,
                closeOnOverlayClick: true,
                animation: 'fade',
                preventScroll: true
            }
        }
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
                    path: '/js/necessary.js'
                },
                // {
                //     type: 'inline',
                //     code: `
                //         console.log('Необходимый скрипт загружен');
                //         // Здесь может быть любой JavaScript код
                //     `
                // }
            ]
        },
        analytics: {
            title: 'Аналитика',
            description: 'Эти файлы cookie помогают нам улучшать наш сайт, собирая информацию о его использовании.',
            required: false,
            scripts: [
                {
                    type: 'file',
                    path: '/js/analytics.js'
                },
                // {
                //     type: 'inline',
                //     code: `
                //         console.log('Аналитический скрипт загружен');
                //         // Google Analytics код
                //         window.dataLayer = window.dataLayer || [];
                //         function gtag(){dataLayer.push(arguments);}
                //         gtag('js', new Date());
                //         gtag('config', 'GA-MEASUREMENT-ID');
                //     `
                // }
            ]
        },
        // marketing: {
        //     title: 'Маркетинг',
        //     description: 'Эти файлы cookie используются для отслеживания посетителей на веб-сайтах.',
        //     required: false,
        //     scripts: [
        //         {
        //             type: 'file',
        //             path: '/js/marketing.js'
        //         }
        //     ]
        // },
        // functional: {
        //     title: 'Функциональные',
        //     description: 'Эти файлы cookie позволяют сайту запоминать сделанные вами выборы.',
        //     required: false,
        //     scripts: [
        //         {
        //             type: 'file',
        //             path: '/js/functional.js'
        //         }
        //     ]
        // }
    },

    // Тексты для баннеров
    texts: {
        mainBanner: {
            title: 'Настройки файлов cookie',
            description: 'Мы используем файлы cookie для улучшения вашего опыта на нашем сайте. Пожалуйста, выберите, какие файлы cookie вы хотите принять.',
            acceptAll: 'Принять все',
            acceptNecessary: 'Только необходимые',
            settings: 'Настроить предпочтения'
        },
        secondaryBanner: {
            title: 'Улучшите свой опыт',
            description: 'Разрешите аналитические и маркетинговые cookie для получения персонализированного контента и улучшения нашего сервиса.',
            acceptAll: 'Разрешить все',
            keepChoice: 'Оставить мой выбор'
        },
        settings: {
            acceptAll: 'Принять все',
            acceptSelected: 'Принять выбранные'
        }
    }
}; 