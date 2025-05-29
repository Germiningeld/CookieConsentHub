/**
 * Custom Matomo Tag Manager implementation
 * Only disables tracking while keeping standard event handling
 */

(function (window, document) {
    'use strict';

    // Basic configuration
    window.MatomoTagManagerConfig = {
        containerId: 'ZcN4ilsH',
        containerUrl: 'https://mtm.klinika-korsakov.ru/js/container_{{containerId}}.js',
        isInitialized: false,
        isStarted: false,
        debug: false
    };

    // Initialize MTM array
    window._mtm = window._mtm || [];

    // Simple logger
    const log = (message) => {
        if (window.MatomoTagManagerConfig.debug) {
            console.log(`[MTM] ${message}`);
        }
    };

    // Main MTM controller
    window.MatomoTagManager = {
        containers: {},

        /**
         * Add container configuration
         * @param {Object} container Container configuration
         */
        addContainer: function (container) {
            log('Adding container: ' + container.id);
            this.containers[container.id] = container;
        },

        /**
         * Get container by ID
         * @param {string} containerId 
         * @returns {Object|null}
         */
        getContainer: function (containerId) {
            return this.containers[containerId] || null;
        },

        /**
         * Initialize container
         * @param {Object} container Container configuration
         */
        initializeContainer: function (container) {
            log('Initializing container: ' + container.id);
            if (typeof container.run === 'function') {
                container.run();
            }
        },

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

                        // Initialize container if available
                        const container = this.getContainer(window.MatomoTagManagerConfig.containerId);
                        if (container) {
                            this.initializeContainer(container);
                        }

                        resolve();
                    };

                    script.onerror = (error) => {
                        log('Failed to load container');
                        reject(error);
                    };

                    const firstScript = document.getElementsByTagName('script')[0];
                    firstScript.parentNode.insertBefore(script, firstScript);
                } catch (error) {
                    log('Error during initialization');
                    reject(error);
                }
            });
        },

        /**
         * Start MTM
         * @returns {boolean}
         */
        start: function () {
            if (window.MatomoTagManagerConfig.isStarted) {
                log('MTM already started');
                return false;
            }

            if (!window.MatomoTagManagerConfig.isInitialized) {
                log('MTM not initialized. Call init() first');
                return false;
            }

            try {
                // Disable tracking
                window._mtm.push({ 'mtm.disableTracking': true });

                // Start MTM
                window._mtm.push({ 'mtm.startTime': (new Date().getTime()) });
                window.MatomoTagManagerConfig.isStarted = true;
                log('Started successfully');
                return true;
            } catch (error) {
                log('Error during start');
                return false;
            }
        },

        /**
         * Push event to MTM (standard way)
         * @param {string} eventName 
         * @param {Object} eventData 
         */
        pushEvent: function (eventName, eventData = {}) {
            if (!window.MatomoTagManagerConfig.isStarted) {
                log('MTM not started. Event not pushed: ' + eventName);
                return;
            }

            // Use standard MTM event format
            window._mtm.push({
                'event': eventName,
                ...eventData
            });
        },

        /**
         * Handle cookie consent changes
         * @param {Object} consent Consent object with category states
         */
        handleConsentChange: function (consent) {
            if (!window.MatomoTagManagerConfig.isStarted) {
                log('MTM not started. Consent change not processed');
                return;
            }

            log('Processing consent change:', consent);

            // Send general consent change event
            this.pushEvent('consentUpdate', {
                consentState: consent
            });

            // Send specific events for each category
            Object.entries(consent).forEach(([category, state]) => {
                this.pushEvent('consentCategory', {
                    category: category,
                    state: state
                });
            });
        }
    };

})(window, document);
