/**
 * Главный файл инициализации CookieConsent
 * @version 2.0.0
 */

// Включаем отладку для диагностики проблем
window.__COOKIE_CONSENT_DEBUG__ = false;

import { CookieConsent } from './cookie-consent.js';

// Создаем логгер для инициализации
const logger = {
    info: (message, data) => {
        if (window.__COOKIE_CONSENT_DEBUG__) {
            console.log(`[CookieConsent-Init] ${message}`, data || '');
        }
    },
    warn: (message, data) => {
        if (window.__COOKIE_CONSENT_DEBUG__) {
            console.warn(`[CookieConsent-Init] ${message}`, data || '');
        }
    },
    error: (message, data) => {
        if (window.__COOKIE_CONSENT_DEBUG__) {
            console.error(`[CookieConsent-Init] ${message}`, data || '');
        }
    }
};

// Экспортируем класс для использования
export { CookieConsent };

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, не был ли уже создан экземпляр
    if (!CookieConsent.instance) {
        try {
            // Создаем экземпляр с дефолтными настройками
            const consent = CookieConsent.init({
                simpleMode: false // Можно изменить на true для простого режима
            });

            // Добавляем отладочные функции в консоль
            window.debugCookieConsent = {
                checkOverlay: () => {
                    const overlay = document.querySelector('.cookie-consent-overlay');
                    if (overlay) {
                        logger.info('Overlay state:', {
                            display: overlay.style.display,
                            opacity: overlay.style.opacity,
                            visibility: overlay.style.visibility,
                            zIndex: overlay.style.zIndex,
                            className: overlay.className,
                            computedStyles: {
                                display: window.getComputedStyle(overlay).display,
                                opacity: window.getComputedStyle(overlay).opacity,
                                visibility: window.getComputedStyle(overlay).visibility
                            }
                        });
                    } else {
                        logger.info('Overlay element not found');
                    }
                },
                
                checkModal: () => {
                    const modal = document.querySelector('.cookie-consent');
                    if (modal) {
                        logger.info('Modal state:', {
                            visible: modal.classList.contains('cookie-consent--visible'),
                            display: modal.style.display,
                            opacity: modal.style.opacity,
                            visibility: modal.style.visibility,
                            className: modal.className
                        });
                    } else {
                        logger.info('Modal element not found');
                    }
                },
                
                hideOverlay: () => {
                    const overlay = document.querySelector('.cookie-consent-overlay');
                    if (overlay) {
                        overlay.style.opacity = '0';
                        overlay.style.visibility = 'hidden';
                        overlay.style.display = 'none';
                        logger.info('Manually hid overlay');
                    }
                },
                
                showOverlay: () => {
                    const overlay = document.querySelector('.cookie-consent-overlay');
                    if (overlay) {
                        overlay.style.display = 'block';
                        overlay.style.opacity = '1';
                        overlay.style.visibility = 'visible';
                        logger.info('Manually showed overlay');
                    }
                },

                getInstance: () => {
                    return CookieConsent.instance;
                },

                testHide: () => {
                    if (CookieConsent.instance) {
                        logger.info('Testing hide method...');
                        CookieConsent.instance._hide();
                    }
                },

                openSettings: () => {
                    if (CookieConsent.instance) {
                        logger.info('Opening settings via debug...');
                        CookieConsent.instance._openSettings();
                    } else {
                        logger.info('No CookieConsent instance found');
                    }
                },

                enableDebug: () => {
                    window.__COOKIE_CONSENT_DEBUG__ = true;
                    console.log('🍪 Cookie Consent Debug Mode Enabled');
                    console.log('Отладочные функции доступны в window.debugCookieConsent:');
                    console.log('- debugCookieConsent.checkOverlay() - проверить состояние оверлея');
                    console.log('- debugCookieConsent.checkModal() - проверить состояние модального окна');
                    console.log('- debugCookieConsent.hideOverlay() - принудительно скрыть оверлей');
                    console.log('- debugCookieConsent.showOverlay() - принудительно показать оверлей');
                    console.log('- debugCookieConsent.testHide() - тестировать метод скрытия');
                    console.log('- debugCookieConsent.openSettings() - открыть настройки');
                    console.log('- debugCookieConsent.disableDebug() - отключить отладку');
                },

                disableDebug: () => {
                    window.__COOKIE_CONSENT_DEBUG__ = false;
                    console.log('Cookie Consent Debug Mode Disabled');
                }
            };

            if (window.__COOKIE_CONSENT_DEBUG__) {
                logger.info('🍪 Cookie Consent Debug Mode Enabled');
                logger.info('Отладочные функции доступны в window.debugCookieConsent');
                logger.info('Для отключения отладки используйте: debugCookieConsent.disableDebug()');
            }

        } catch (error) {
            logger.error('Failed to initialize CookieConsent:', error);
        }
    } else {
        logger.info('CookieConsent instance already exists');
    }
});

// Глобальные методы для удобства использования
window.cookieConsent = {
    init: (options) => CookieConsent.init(options),
    hasConsent: (category) => CookieConsent.hasConsent(category),
    getConsent: () => CookieConsent.getConsent(),
    openSettings: () => CookieConsent.openSettings(),
    show: () => CookieConsent.show(),
    hide: () => CookieConsent.hide()
};