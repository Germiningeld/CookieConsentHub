/**
 * Custom Matomo Tag Manager implementation with delayed start
 * This implementation ensures no tracking occurs until explicit consent is given
 */

(function (window, document) {
    'use strict';

    // Configuration object
    window.MatomoTagManagerConfig = {
        containerId: 'ZcN4ilsH',
        containerUrl: 'https://mtm.klinika-korsakov.ru/js/container_{{containerId}}.js',
        isInitialized: false,
        isStarted: false,
        debug: false
    };

    // Initialize MTM array without starting
    window._mtm = window._mtm || [];

    // Logger utility
    const log = (message, type = 'info') => {
        if (window.MatomoTagManagerConfig.debug) {
            console[type](`[MTM] ${message}`);
        }
    };

    // Main MTM controller
    window.MatomoTagManager = {
        /**
         * Initialize MTM container
         * @param {Object} config Optional configuration object
         * @returns {Promise}
         */
        init: function (config = {}) {
            return new Promise((resolve, reject) => {
                if (window.MatomoTagManagerConfig.isInitialized) {
                    log('MTM already initialized');
                    resolve();
                    return;
                }

                // Update configuration
                Object.assign(window.MatomoTagManagerConfig, config);

                try {
                    const script = document.createElement('script');
                    script.async = true;
                    script.src = window.MatomoTagManagerConfig.containerUrl.replace(
                        '{{containerId}}',
                        window.MatomoTagManagerConfig.containerId
                    );

                    script.onload = () => {
                        window.MatomoTagManagerConfig.isInitialized = true;
                        log('Container loaded successfully');
                        resolve();
                    };

                    script.onerror = (error) => {
                        log('Failed to load container', 'error');
                        reject(error);
                    };

                    const firstScript = document.getElementsByTagName('script')[0];
                    firstScript.parentNode.insertBefore(script, firstScript);
                } catch (error) {
                    log('Error during initialization', 'error');
                    reject(error);
                }
            });
        },

        /**
         * Start MTM tracking
         * @returns {boolean}
         */
        start: function () {
            if (window.MatomoTagManagerConfig.isStarted) {
                log('MTM already started');
                return false;
            }

            if (!window.MatomoTagManagerConfig.isInitialized) {
                log('MTM not initialized. Call init() first', 'error');
                return false;
            }

            try {
                window._mtm.push({
                    'mtm.startTime': (new Date().getTime()),
                    'event': 'mtm.Start'
                });
                window.MatomoTagManagerConfig.isStarted = true;
                log('Started successfully');
                return true;
            } catch (error) {
                log('Error during start', 'error');
                return false;
            }
        },

        /**
         * Push custom event to MTM
         * @param {string} eventName 
         * @param {Object} eventData 
         */
        pushEvent: function (eventName, eventData = {}) {
            if (!window.MatomoTagManagerConfig.isStarted) {
                log('MTM not started. Event not pushed: ' + eventName, 'warn');
                return;
            }

            try {
                window._mtm.push({
                    event: eventName,
                    ...eventData
                });
                log(`Event pushed: ${eventName}`);
            } catch (error) {
                log(`Error pushing event: ${eventName}`, 'error');
            }
        }
    };

    // Integration with CookieConsentHub
    if (window.CookieConsent) {
        window.addEventListener('cookieConsent', function (event) {
            const consent = event.detail;

            // Check if analytics/statistics category is accepted
            if (consent.analytics || consent.statistics) {
                // Initialize and start MTM if consent is given
                window.MatomoTagManager.init()
                    .then(() => {
                        window.MatomoTagManager.start();
                        // Push consent data to MTM
                        window.MatomoTagManager.pushEvent('cookieConsent', consent);
                    })
                    .catch(error => {
                        log('Failed to initialize MTM after consent', 'error');
                    });
            }
        });
    }

})(window, document);
