/**
 * Главный файл инициализации CookieConsent
 * @version 2.0.0
 */

import { CookieConsent } from './cookie-consent.js';
import { cookieConsentConfig } from './cookie-consent-config.js';

// Включаем отладку из конфигурации
window.__COOKIE_CONSENT_DEBUG__ = cookieConsentConfig.core.debugMode;

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
    // Проверяем, включена ли автоматическая инициализация
    if (!cookieConsentConfig.core.autoInit) {
        logger.info('Auto-initialization disabled in config');
        return;
    }

    // Проверяем, не был ли уже создан экземпляр
    if (!CookieConsent.instance) {
        try {
            // Создаем экземпляр с настройками из конфигурации
            const consent = CookieConsent.init({
                simpleMode: cookieConsentConfig.core.simpleMode
            });

            logger.info('CookieConsent initialized', {
                simpleMode: cookieConsentConfig.core.simpleMode,
                debugMode: cookieConsentConfig.core.debugMode,
                autoInit: cookieConsentConfig.core.autoInit
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

                getConfig: () => {
                    return cookieConsentConfig;
                },

                debugSimpleNotification: () => {
                    const config = cookieConsentConfig.texts.simpleNotification;
                    logger.info('SimpleNotification config:', config);
                    
                    const modal = document.querySelector('.cookie-consent');
                    if (modal) {
                        const title = modal.querySelector('.cookie-consent__title');
                        const description = modal.querySelector('.cookie-consent__description');
                        const button = modal.querySelector('.cookie-consent__button--accept');
                        
                        logger.info('SimpleNotification DOM elements:', {
                            title: title ? title.textContent : 'NOT FOUND',
                            titleHTML: title ? title.innerHTML : 'NOT FOUND',
                            description: description ? description.textContent : 'NOT FOUND',
                            descriptionHTML: description ? description.innerHTML : 'NOT FOUND',
                            button: button ? button.textContent : 'NOT FOUND',
                            modalClasses: modal.className,
                            modalHTML: modal.innerHTML.substring(0, 500) + '...'
                        });

                        // Проверяем CSS стили для description
                        if (description) {
                            const styles = window.getComputedStyle(description);
                            logger.info('Description computed styles:', {
                                display: styles.display,
                                visibility: styles.visibility,
                                opacity: styles.opacity,
                                height: styles.height,
                                overflow: styles.overflow,
                                color: styles.color,
                                fontSize: styles.fontSize
                            });
                        }
                    } else {
                        logger.info('Modal not found');
                    }
                },

                testSimpleMode: () => {
                    logger.info('Testing simple mode...');
                    
                    // Очищаем localStorage для чистого тестирования
                    localStorage.removeItem('cookieConsent');
                    
                    // Включаем простой режим
                    cookieConsentConfig.core.simpleMode = true;
                    
                    // Удаляем существующие элементы
                    document.querySelector('.cookie-consent')?.remove();
                    document.querySelector('.cookie-consent-overlay')?.remove();
                    
                    // Сбрасываем экземпляр
                    if (CookieConsent.instance) {
                        CookieConsent.instance = null;
                        window.cookieConsentInstance = null;
                    }
                    
                    // Создаем новый экземпляр
                    const instance = CookieConsent.init({
                        simpleMode: true
                    });
                    
                    // Проверяем результат через секунду
                    setTimeout(() => {
                        window.debugCookieConsent.debugSimpleNotification();
                    }, 1000);
                },

                updateSimpleMode: (enabled) => {
                    logger.info(`Updating simpleMode to: ${enabled}`);
                    cookieConsentConfig.core.simpleMode = enabled;
                    
                    // Очищаем localStorage для корректного переключения
                    localStorage.removeItem('cookieConsent');
                    
                    // Пересоздаем экземпляр с новыми настройками
                    if (CookieConsent.instance) {
                        // Удаляем текущие элементы
                        document.querySelector('.cookie-consent')?.remove();
                        document.querySelector('.cookie-consent-overlay')?.remove();
                        
                        // Сбрасываем экземпляр
                        CookieConsent.instance = null;
                        window.cookieConsentInstance = null;
                        
                        // Создаем новый
                        CookieConsent.init({
                            simpleMode: enabled
                        });

                        // Показываем результат
                        setTimeout(() => {
                            if (enabled) {
                                window.debugCookieConsent.debugSimpleNotification();
                            } else {
                                logger.info('Switched to advanced mode');
                            }
                        }, 500);
                    }
                },

                showSimpleNotification: () => {
                    if (CookieConsent.instance) {
                        logger.info('Manually showing simple notification...');
                        CookieConsent.instance._showSimpleNotification();
                        
                        setTimeout(() => {
                            window.debugCookieConsent.debugSimpleNotification();
                        }, 500);
                    } else {
                        logger.info('No CookieConsent instance found');
                    }
                },

                inspectConfig: () => {
                    logger.info('Full configuration:', cookieConsentConfig);
                    logger.info('Simple notification texts:', cookieConsentConfig.texts.simpleNotification);
                    logger.info('Core settings:', cookieConsentConfig.core);
                },

                testConfigValidation: () => {
                    if (CookieConsent.instance) {
                        try {
                            CookieConsent.instance._validateConfig();
                            logger.info('Config validation passed');
                        } catch (error) {
                            logger.error('Config validation failed:', error);
                        }
                    }
                },

                enableDebug: () => {
                    window.__COOKIE_CONSENT_DEBUG__ = true;
                    cookieConsentConfig.core.debugMode = true;
                    console.log('🍪 Cookie Consent Debug Mode Enabled');
                    console.log('Отладочные функции доступны в window.debugCookieConsent:');
                    console.log('- debugCookieConsent.checkOverlay() - проверить состояние оверлея');
                    console.log('- debugCookieConsent.checkModal() - проверить состояние модального окна');
                    console.log('- debugCookieConsent.hideOverlay() - принудительно скрыть оверлей');
                    console.log('- debugCookieConsent.showOverlay() - принудительно показать оверлей');
                    console.log('- debugCookieConsent.testHide() - тестировать метод скрытия');
                    console.log('- debugCookieConsent.openSettings() - открыть настройки');
                    console.log('- debugCookieConsent.getConfig() - получить текущую конфигурацию');
                    console.log('- debugCookieConsent.debugSimpleNotification() - отладка простого уведомления');
                    console.log('- debugCookieConsent.testSimpleMode() - тест простого режима');
                    console.log('- debugCookieConsent.updateSimpleMode(true/false) - переключить простой режим');
                    console.log('- debugCookieConsent.showSimpleNotification() - показать простое уведомление');
                    console.log('- debugCookieConsent.inspectConfig() - проверить конфигурацию');
                    console.log('- debugCookieConsent.testConfigValidation() - проверить валидацию конфигурации');
                    console.log('- debugCookieConsent.disableDebug() - отключить отладку');
                },

                disableDebug: () => {
                    window.__COOKIE_CONSENT_DEBUG__ = false;
                    cookieConsentConfig.core.debugMode = false;
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
    hide: () => CookieConsent.hide(),
    getConfig: () => cookieConsentConfig
};