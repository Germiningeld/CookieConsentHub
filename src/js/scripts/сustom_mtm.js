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
        },

        /**
         * Setup CookieConsent integration
         */
        setupCookieConsentIntegration: function () {
            if (!window.CookieConsent) {
                log('CookieConsent not found, waiting...', 'warn');
                return;
            }

            try {
                // Wait for CookieConsent to be ready
                if (window.CookieConsent.instance) {
                    this.bindCookieConsentEvents();
                } else {
                    // Wait for CookieConsent to initialize
                    const observer = new MutationObserver((mutations, obs) => {
                        if (window.CookieConsent && window.CookieConsent.instance) {
                            obs.disconnect();
                            this.bindCookieConsentEvents();
                        }
                    });

                    observer.observe(document, {
                        childList: true,
                        subtree: true
                    });
                }
            } catch (error) {
                log('Error setting up CookieConsent integration', 'error');
            }
        },

        /**
         * Bind CookieConsent events
         */
        bindCookieConsentEvents: function () {
            try {
                // Check initial consent
                const initialConsent = window.CookieConsent.getConsent();
                if (initialConsent && (initialConsent.analytics || initialConsent.statistics)) {
                    this.init()
                        .then(() => {
                            this.start();
                            this.pushEvent('cookieConsent', initialConsent);
                        })
                        .catch(error => {
                            log('Failed to initialize MTM with initial consent', 'error');
                        });
                }

                // Listen for consent changes
                window.addEventListener('cookieConsent', (event) => {
                    const consent = event.detail;
                    if (consent.analytics || consent.statistics) {
                        if (!this.isInitialized) {
                            this.init()
                                .then(() => {
                                    this.start();
                                    this.pushEvent('cookieConsent', consent);
                                })
                                .catch(error => {
                                    log('Failed to initialize MTM after consent', 'error');
                                });
                        } else {
                            this.pushEvent('cookieConsent', consent);
                        }
                    }
                });

                log('CookieConsent integration setup complete');
            } catch (error) {
                log('Error binding CookieConsent events', 'error');
            }
        }
    };

    // Initialize CookieConsent integration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.MatomoTagManager.setupCookieConsentIntegration();
        });
    } else {
        window.MatomoTagManager.setupCookieConsentIntegration();
    }

})(window, document); 