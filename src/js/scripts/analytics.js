// Скрипт аналитики для демонстрации
(function() {
    console.log('[Cookie Consent] Analytics script loaded');
    
    // Имитация инициализации аналитики
    window.analytics = {
        track: function(event) {
            console.log('[Cookie Consent] Analytics event tracked:', event);
        },
        pageView: function(page) {
            console.log('[Cookie Consent] Analytics page view:', page);
        }
    };

    // Отправляем событие в GTM о загрузке скрипта
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'loadAnalytics',
            'source': 'analytics.js',
            'category': 'analytics',
            'timestamp': new Date().toISOString()
        });
    }
})(); 