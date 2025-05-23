export const cookieConsentConfig = {
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
                {
                    type: 'inline',
                    code: `
                        console.log('Необходимый скрипт загружен');
                        // Здесь может быть любой JavaScript код
                    `
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
                    path: '/js/analytics.js'
                },
                {
                    type: 'inline',
                    code: `
                        console.log('Аналитический скрипт загружен');
                        // Google Analytics код
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'GA-MEASUREMENT-ID');
                    `
                }
            ]
        },
        marketing: {
            title: 'Маркетинг',
            description: 'Эти файлы cookie используются для отслеживания посетителей на веб-сайтах.',
            required: false,
            scripts: [
                {
                    type: 'file',
                    path: '/js/marketing.js'
                }
            ]
        },
        functional: {
            title: 'Функциональные',
            description: 'Эти файлы cookie позволяют сайту запоминать сделанные вами выборы.',
            required: false,
            scripts: [
                {
                    type: 'file',
                    path: '/js/functional.js'
                }
            ]
        }
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