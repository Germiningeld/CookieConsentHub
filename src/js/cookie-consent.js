/**
 * CookieConsent - Скрипт уведомления о файлах cookie
 * @version 2.0.0
 */

import { cookieConsentConfig } from './cookie-consent-config.js';

/**
 * Основной класс для управления согласием на cookie
 */
export class CookieConsent {
    static instance = null;

    constructor(config = {}) {
        // Проверяем singleton
        if (CookieConsent.instance) {
            this._logger = new Logger('CookieConsent');
            this._logger.warn('CookieConsent instance already exists');
            return CookieConsent.instance;
        }

        this._logger = new Logger('CookieConsent');
        this._logger.info('Initializing CookieConsent');

        // Генерируем CSRF токен
        this._csrfToken = this._getStoredCsrfToken() || this._generateCsrfToken();
        this._storeCsrfToken(this._csrfToken);

        // Инициализируем состояние
        this._initializeState();
        this._initializeConfig(config);

        // Устанавливаем singleton
        CookieConsent.instance = this;
        window.cookieConsentInstance = this;

        // Добавляем заголовки безопасности
        this._addSecurityHeaders();

        // Инициализируем компонент
        this._initialize();
    }

    /**
     * Инициализирует внутреннее состояние
     */
    _initializeState() {
        this.notification = null;
        this.overlay = null;
        this.isVisible = false;
        this.currentModalType = null;
        this.isSimpleMode = false;
        this._scrollPosition = null;
        this._cookiesCleared = false;
        this._pendingReload = false;
        this._overlayClickHandler = null;
        this._closedViaCloseButton = false; // Флаг для отслеживания способа закрытия
    }

    /**
     * Инициализирует конфигурацию
     */
    _initializeConfig(config) {
        try {
            this.isSimpleMode = config.simpleMode || false;

            this.config = {
                modalTypes: cookieConsentConfig.modalTypes,
                visual: { ...cookieConsentConfig.visual, ...config.visual },
                categories: { ...cookieConsentConfig.categories, ...config.categories },
                texts: { ...cookieConsentConfig.texts, ...config.texts },
                tagManagers: { ...cookieConsentConfig.tagManagers, ...config.tagManagers },
                styles: { ...cookieConsentConfig.styles, ...config.styles },        // ✅ ДОБАВИТЬ ЭТУ СТРОКУ
                security: { ...cookieConsentConfig.security, ...config.security }   // ✅ И ЭТУ ТОЖЕ
            };

            this._validateConfig();
        } catch (error) {
            this._logger.error('Failed to initialize config:', error);
            throw error;
        }
    }

    /**
     * Валидирует конфигурацию
     */
    _validateConfig() {
        const requiredFields = ['modalTypes', 'visual', 'categories', 'texts', 'tagManagers'];
        const missingFields = requiredFields.filter(field => !this.config[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required config fields: ${missingFields.join(', ')}`);
        }

        if (!this.config.categories.necessary) {
            throw new Error('Necessary category is required in config');
        }

        const requiredTexts = ['mainBanner', 'experienceImprove', 'settings', 'simpleNotification'];
        const missingTexts = requiredTexts.filter(text => !this.config.texts[text]);

        if (missingTexts.length > 0) {
            throw new Error(`Missing required text fields: ${missingTexts.join(', ')}`);
        }

        // Дополнительная проверка для simpleNotification
        if (!this.config.texts.simpleNotification.title ||
            !this.config.texts.simpleNotification.description ||
            !this.config.texts.simpleNotification.acceptButton) {
            throw new Error('simpleNotification must have title, description and acceptButton');
        }

        this._logger.info('Config validation passed');
    }

    /**
     * Загружает CSS файлы из конфигурации
     */
    _loadCSSFiles() {
        if (!this.config.styles?.autoLoadCSS) {
            this._logger.info('CSS auto-loading disabled');
            return;
        }

        const cssFiles = this.config.styles.cssFiles || [];
        if (cssFiles.length === 0) {
            this._logger.info('No CSS files to load');
            return;
        }

        cssFiles.forEach(cssPath => {
            this._loadCSSFile(cssPath);
        });
    }

    /**
     * Загружает один CSS файл
     * @param {string} cssPath - Путь к CSS файлу
     */
    _loadCSSFile(cssPath) {
        // Проверяем, не загружен ли уже этот файл
        const existingLink = document.querySelector(`link[href="${cssPath}"]`);
        if (existingLink) {
            this._logger.info(`CSS file already loaded: ${cssPath}`);
            return;
        }

        // Формируем полный путь
        const fullPath = cssPath.startsWith('http') ? cssPath : (cssPath.startsWith('/') ? cssPath : '/' + cssPath);

        // Создаем link элемент
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = fullPath;

        // Добавляем обработчики событий
        link.onload = () => {
            this._logger.info(`CSS file loaded successfully: ${fullPath}`);
        };

        link.onerror = (error) => {
            this._logger.error(`Failed to load CSS file: ${fullPath}`, error);
        };

        // Добавляем в head
        document.head.appendChild(link);
        this._logger.info(`Loading CSS file: ${fullPath}`);
    }

    /**
     * Основная инициализация 
     */
    _initialize() {
        try {
            // Загружаем CSS файлы перед показом модальных окон
            this._loadCSSFiles();

            if (this.isSimpleMode) {
                // В простом режиме: новая логика
                const savedConsent = this._getStoredConsent();
                this._logger.info('Simple mode - Retrieved saved consent:', savedConsent);

                // Проверяем, нужно ли показывать баннер
                if (this._shouldShowSimpleBanner(savedConsent)) {
                    this._logger.info('Simple mode - Showing banner and creating initial consent');

                    // Создаем полный объект согласия со всеми категориями, но БЕЗ is_cookies_accepted
                    const initialConsent = this._createSimpleInitialConsent();
                    this._saveConsent(initialConsent);
                    this._logger.info('Simple mode - Initial consent saved:', initialConsent);

                    // Загружаем все скрипты
                    this._clearUnauthorizedCookies(initialConsent);
                    this._loadScripts(initialConsent);

                    // Показываем баннер
                    this._createElements();
                    this._showSimpleNotification();
                } else {
                    this._logger.info('Simple mode - Banner hidden (user already accepted)');
                    // Загружаем скрипты на основе сохраненного согласия
                    this._clearUnauthorizedCookies(savedConsent);
                    this._loadScripts(savedConsent);
                }
                return;
            }

            // Обычный режим - оригинальная логика
            const savedConsent = this._getStoredConsent();
            this._logger.info('Retrieved saved consent:', savedConsent);

            if (this._isValidConsent(savedConsent)) {
                this._logger.info('Valid consent found, loading scripts');
                this._clearUnauthorizedCookies(savedConsent);
                this._loadScripts(savedConsent);
                return;
            }

            this._logger.info('No valid consent found, showing banner');
            this._createElements();
            this._showInitialModal();

        } catch (error) {
            this._logger.error('Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Создает начальный объект согласия для простого режима (без is_cookies_accepted)
     */
    _createSimpleInitialConsent() {
        const consent = {
            // НЕ добавляем is_cookies_accepted и timestamp - они добавятся при нажатии OK
        };

        // Добавляем все категории как принятые
        Object.entries(this.config.categories).forEach(([key, category]) => {
            consent[key] = true;
        });

        return consent;
    }

    /**
     * Обработчик нажатия кнопки "OK" в простом режиме
     */
    _handleSimpleAccept() {
        this._logger.info('Simple accept clicked - updating consent with acceptance');

        // Получаем текущее согласие
        const currentConsent = this._getStoredConsent() || {};
        this._logger.info('Current consent before update:', currentConsent);

        // Добавляем is_cookies_accepted и timestamp к существующему согласию
        const updatedConsent = {
            ...currentConsent,
            is_cookies_accepted: 1,
            timestamp: Date.now()
        };

        this._logger.info('Updated consent to save:', updatedConsent);

        // Сохраняем обновленное согласие
        this._saveConsent(updatedConsent);

        // Проверяем что сохранилось
        const savedConsent = this._getStoredConsent();
        this._logger.info('Consent after saving:', savedConsent);

        // Скрываем баннер
        this._hide();

        this._logger.info('Simple mode - consent update completed');
    }


    /**
     * Проверяет, нужно ли показывать баннер в простом режиме
     */
    _shouldShowSimpleBanner(consent) {
        // Показываем баннер если:
        // 1. Нет сохраненного согласия вообще
        // 2. Есть согласие, но is_cookies_accepted не равен 1
        if (!consent) {
            this._logger.info('No consent found - showing banner');
            return true;
        }

        if (consent.is_cookies_accepted !== 1) {
            this._logger.info('Consent not accepted (is_cookies_accepted !== 1) - showing banner');
            return true;
        }

        // Проверяем срок действия согласия
        const expirationTime = this.config.core?.consentExpiration || (24 * 60 * 60 * 1000);
        if (consent.timestamp && Date.now() - consent.timestamp > expirationTime) {
            this._logger.info('Consent expired - showing banner');
            return true;
        }

        this._logger.info('Valid consent found - hiding banner');
        return false;
    }

    /**
     * Проверяет валидность сохраненного согласия
     */
    _isValidConsent(consent) {
        // В простом режиме используем отдельную логику
        if (this.isSimpleMode) {
            return !this._shouldShowSimpleBanner(consent);
        }

        // Оригинальная логика для обычного режима
        if (!consent || consent.is_cookies_accepted !== 1) {
            return false;
        }

        // Используем срок действия из конфигурации
        const expirationTime = this.config.core?.consentExpiration || (24 * 60 * 60 * 1000);
        if (consent.timestamp && Date.now() - consent.timestamp > expirationTime) {
            this._logger.info('Consent expired');
            return false;
        }

        return true;
    }

    /**
     * Создает DOM элементы
     */
    _createElements() {
        if (document.querySelector('.cookie-consent')) {
            document.querySelector('.cookie-consent')?.remove();
            document.querySelector('.cookie-consent-overlay')?.remove();
        }

        this._createOverlay();
        this._createNotification();
        this._logger.info('DOM elements created');
    }

    /**
     * Создает оверлей
     */
    _createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'cookie-consent-overlay';
        this.overlay.style.setProperty('--cookie-consent-blur', this.config.visual.overlay.blur);
        this.overlay.style.setProperty('--cookie-consent-overlay-color', this.config.visual.overlay.color);
        this.overlay.style.setProperty('--cookie-consent-overlay-z-index', this.config.visual.overlay.zIndex);

        // Устанавливаем начальные стили
        this.overlay.style.display = 'none';
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';

        document.body.appendChild(this.overlay);
        this._logger.info('Overlay created and added to DOM');
    }

    /**
     * Создает уведомление
     */
    _createNotification() {
        this.notification = document.createElement('div');
        this.notification.className = 'cookie-consent';
        this.notification.style.setProperty('--cookie-consent-z-index', this.config.visual.modal.zIndex);
        this.notification.style.setProperty('--cookie-consent-max-width', this.config.visual.modal.maxWidth);
        this.notification.style.setProperty('--cookie-consent-border-radius', this.config.visual.modal.borderRadius);
        this.notification.style.setProperty('--cookie-consent-box-shadow', this.config.visual.modal.boxShadow);

        // Добавляем возможность скролла для высоких модальных окон
        this.notification.style.maxHeight = '90vh';
        this.notification.style.overflowY = 'auto';

        document.body.appendChild(this.notification);
    }

    /**
     * Показывает начальное модальное окно
     */
    _showInitialModal() {
        this.currentModalType = this.config.modalTypes.INITIAL;
        this._renderModal();
        this._show();
    }

    /**
     * Показывает простое уведомление
     */
    _showSimpleNotification() {
        if (!this.notification) {
            this._createElements();
        }
        this.currentModalType = this.config.modalTypes.SIMPLE_NOTIFICATION;
        this._renderModal();
        this._show();
    }

    /**
     * Рендерит модальное окно
     */
    _renderModal() {
        if (!this.notification) {
            this._createElements();
        }

        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        if (!modalSettings) {
            this._logger.warn(`Modal settings not found for type: ${this.currentModalType}`);
            return;
        }

        this._applyModalStyles(modalSettings);
        this._renderModalContent();
        this._addEventListeners();
    }

    /**
     * Применяет стили модального окна
     */
    _applyModalStyles(modalSettings) {
        // Сбрасываем классы
        this.notification.className = 'cookie-consent';

        // Применяем позиционирование
        if (modalSettings.position === 'top') {
            this.notification.classList.add('cookie-consent--top');
        } else if (modalSettings.position === 'bottom') {
            this.notification.classList.add('cookie-consent--bottom');
        }

        // Применяем анимацию
        if (modalSettings.animation !== 'none') {
            this.notification.classList.add(`cookie-consent--${modalSettings.animation}`);
        }

        // Применяем ширину
        this.notification.style.setProperty('--cookie-consent-max-width', modalSettings.maxWidth);

        // Настраиваем оверлей
        if (modalSettings.showOverlay) {
            this.overlay.style.display = 'block';
        } else {
            this.overlay.style.display = 'none';
        }
    }

    /**
     * Рендерит содержимое модального окна
     */
    _renderModalContent() {
        let content = '';

        switch (this.currentModalType) {
            case this.config.modalTypes.INITIAL:
                content = this._renderInitialContent();
                break;
            case this.config.modalTypes.MANUAL_SETTINGS:
                content = this._renderSettingsContent();
                break;
            case this.config.modalTypes.EXPERIENCE_IMPROVE:
                content = this._renderExperienceImproveContent();
                break;
            case this.config.modalTypes.SIMPLE_NOTIFICATION:
                content = this._renderSimpleNotificationContent();
                break;
            default:
                this._logger.warn(`Unknown modal type: ${this.currentModalType}`);
                return;
        }

        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                ${this._shouldShowCloseButton() ? '<button class="cookie-consent__close-button" aria-label="Закрыть"></button>' : ''}
                ${content}
            </div>
        `;
    }

    /**
     * Рендерит содержимое начального модального окна
     */
    _renderInitialContent() {
        const texts = this.config.texts.mainBanner;
        return `
            <h2 class="cookie-consent__title">${this._escapeHtml(texts.title)}</h2>
            <div class="cookie-consent__description">
                ${this._wrapTextInParagraphs(texts.description)}
            </div>
            <div class="cookie-consent__buttons">
                <button class="cookie-consent__button cookie-consent__button--all">${this._escapeHtml(texts.acceptAll)}</button>
                <button class="cookie-consent__button cookie-consent__button--necessary">${this._escapeHtml(texts.acceptNecessary)}</button>
                <a href="#" class="cookie-consent__link cookie-consent__link--settings">${this._escapeHtml(texts.settings)}</a>
            </div>
        `;
    }

    /**
     * Рендерит содержимое настроек
     */
    _renderSettingsContent() {
        const texts = this.config.texts.mainBanner;
        const settingsTexts = this.config.texts.settings;
        const savedConsent = this._getStoredConsent() || {};

        return `
            <h2 class="cookie-consent__title">${this._escapeHtml(texts.title)}</h2>
            <div class="cookie-consent__description">
                ${this._wrapTextInParagraphs(texts.description)}
            </div>
            <div class="cookie-consent__categories cookie-consent__categories--visible">
                ${this._renderCategories(savedConsent)}
            </div>
            <div class="cookie-consent__buttons">
                <button class="cookie-consent__button cookie-consent__button--all">${this._escapeHtml(settingsTexts.acceptAll)}</button>
                <button class="cookie-consent__button cookie-consent__button--selected">${this._escapeHtml(settingsTexts.acceptSelected)}</button>
            </div>
        `;
    }

    /**
     * Рендерит содержимое баннера улучшения опыта
     */
    _renderExperienceImproveContent() {
        const texts = this.config.texts.experienceImprove;
        return `
            <h2 class="cookie-consent__title">${this._escapeHtml(texts.title)}</h2>
            <div class="cookie-consent__description">
                ${this._wrapTextInParagraphs(texts.description)}
            </div>
            <div class="cookie-consent__buttons">
                <button class="cookie-consent__button cookie-consent__button--all">${this._escapeHtml(texts.acceptAll)}</button>
                <button class="cookie-consent__button cookie-consent__button--keep">${this._escapeHtml(texts.keepChoice)}</button>
            </div>
        `;
    }

    /**
     * Рендерит простое уведомление
     */
    _renderSimpleNotificationContent() {
        const texts = this.config.texts.simpleNotification;

        this._logger.info('=== renderSimpleNotificationContent START ===');
        this._logger.info('texts.simpleNotification:', texts);
        this._logger.info('texts.title:', texts.title);
        this._logger.info('texts.description:', texts.description);
        this._logger.info('texts.acceptButton:', texts.acceptButton);

        const wrappedDescription = this._wrapTextInParagraphs(texts.description);
        this._logger.info('wrappedDescription result:', wrappedDescription);

        const content = `
        <div class="cookie-consent__header">
            <h2 class="cookie-consent__title">${this._escapeHtml(texts.title)}</h2>
            <div class="cookie-consent__description">
                ${wrappedDescription}
            </div>
        </div>
        <div class="cookie-consent__buttons">
            <button class="cookie-consent__button cookie-consent__button--accept">${this._escapeHtml(texts.acceptButton)}</button>
        </div>
    `;

        this._logger.info('Final content:', content);
        this._logger.info('=== renderSimpleNotificationContent END ===');

        return content;
    }

    /**
     * Рендерит категории
     */
    _renderCategories(savedConsent) {
        return Object.entries(this.config.categories)
            .map(([key, category]) => this._renderCategory(key, category, savedConsent[key] || false))
            .join('');
    }

    /**
     * Рендерит одну категорию
     */
    _renderCategory(key, category, isChecked) {
        return `
            <div class="cookie-consent__category">
                <label class="cookie-consent__checkbox">
                    <input type="checkbox" name="${this._escapeHtml(key)}" 
                        ${category.required ? 'checked disabled' : ''} 
                        ${isChecked ? 'checked' : ''}>
                    <div>
                        <div class="cookie-consent__category-title">${this._escapeHtml(category.title)}</div>
                        <div class="cookie-consent__category-description">
                            ${this._wrapTextInParagraphs(category.description)}
                        </div>
                    </div>
                </label>
            </div>
        `;
    }

    /**
     * Определяет, нужно ли показывать кнопку закрытия
     */
    _shouldShowCloseButton() {
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        return modalSettings?.allowClose || false;
    }

    /**
     * Добавляет обработчики событий
     */
    _addEventListeners() {
        // Удаляем старые обработчики
        this._removeOldEventListeners();

        // Добавляем новые обработчики
        const handlers = {
            '.cookie-consent__button--all': () => this._handleAcceptAll(),
            '.cookie-consent__button--necessary': () => this._handleAcceptNecessary(),
            '.cookie-consent__button--selected': () => this._handleAcceptSelected(),
            '.cookie-consent__button--accept': () => this._handleSimpleAccept(),
            '.cookie-consent__button--keep': () => this._handleKeepChoice(),
            '.cookie-consent__link--settings': (e) => {
                e.preventDefault();
                this._openSettings();
            },
            '.cookie-consent__close-button': () => {
                // Устанавливаем флаг закрытия через кнопку
                this._closedViaCloseButton = true;
                this._handleClose();
                // Сбрасываем флаг после обработки
                setTimeout(() => {
                    this._closedViaCloseButton = false;
                }, 100);
            }
        };

        Object.entries(handlers).forEach(([selector, handler]) => {
            const elements = this.notification.querySelectorAll(selector);
            elements.forEach(element => {
                element.addEventListener('click', handler);
            });
        });

        // Обработчик для оверлея
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        if (modalSettings?.closeOnOverlayClick) {
            // Удаляем старый обработчик если есть
            if (this._overlayClickHandler) {
                this.overlay.removeEventListener('click', this._overlayClickHandler);
            }

            // Создаем новый обработчик
            this._overlayClickHandler = (e) => {
                // Проверяем, что клик был именно по оверлею, а не по модальному окну
                if (e.target === this.overlay) {
                    this._closedViaCloseButton = true;
                    this._handleClose();
                    setTimeout(() => {
                        this._closedViaCloseButton = false;
                    }, 100);
                }
            };

            this.overlay.addEventListener('click', this._overlayClickHandler);
        }
    }

    /**
     * Удаляет старые обработчики событий
     */
    _removeOldEventListeners() {
        const selectors = [
            'button',
            '.cookie-consent__link--settings',
            '.cookie-consent__checkbox input[type="checkbox"]'
        ];

        selectors.forEach(selector => {
            const elements = this.notification.querySelectorAll(selector);
            elements.forEach(element => {
                const clone = element.cloneNode(true);
                element.parentNode.replaceChild(clone, element);
            });
        });

        // Также удаляем обработчик оверлея
        if (this._overlayClickHandler) {
            this.overlay.removeEventListener('click', this._overlayClickHandler);
            this._overlayClickHandler = null;
        }
    }

    /**
     * Показывает модальное окно
     */
    _show() {
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        if (!modalSettings) return;

        this.notification.classList.add('cookie-consent--visible');

        if (modalSettings.showOverlay && this.overlay) {
            // Сначала устанавливаем display: block
            this.overlay.style.display = 'block';
            this.overlay.style.opacity = '0';
            this.overlay.style.visibility = 'hidden';

            // Принудительно показываем оверлей в следующем кадре
            requestAnimationFrame(() => {
                if (this.overlay) {
                    this.overlay.style.opacity = '1';
                    this.overlay.style.visibility = 'visible';
                    this.overlay.classList.add('cookie-consent-overlay--visible');
                }
            });
        }

        this.isVisible = true;

        if (modalSettings.preventScroll) {
            this._scrollPosition = window.pageYOffset;
            document.body.classList.add('cookie-consent-no-scroll');
            document.body.style.top = `-${this._scrollPosition}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    }

    /**
     * Скрывает модальное окно
     */
    _hide() {
        this._logger.info('Hiding modal');

        this.notification.classList.remove('cookie-consent--visible');

        // Немедленно и принудительно скрываем оверлей
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            this.overlay.style.visibility = 'hidden';
            this.overlay.style.display = 'none';

            // Убираем любые классы анимации
            this.overlay.classList.remove('cookie-consent-overlay--visible');
        }

        this.isVisible = false;

        // Восстанавливаем скролл
        if (this._scrollPosition !== null) {
            document.body.classList.remove('cookie-consent-no-scroll');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, this._scrollPosition);
            this._scrollPosition = null;
        }
    }

    /**
     * Обработчики событий
     */
    _handleAcceptAll() {
        this._logger.info('Accept all clicked - hiding modal');
        const consent = this._createConsentObject(true);
        this._saveConsent(consent);
        this._clearUnauthorizedCookies(consent);
        this._loadScripts(consent);
        this._hide();
    }

    _handleAcceptNecessary() {
        this._logger.info('Accept necessary clicked');
        const consent = this._createConsentObject(false);
        this._saveConsent(consent);
        this._clearUnauthorizedCookies(consent);
        this._loadScripts(consent);

        const modalSettings = this.config.visual.modalTypes[this.currentModalType];

        // Показываем баннер улучшения опыта только если это предусмотрено настройками
        // и если пользователь не закрыл окно принудительно через кнопку закрытия
        if (modalSettings?.showExperienceImprove && !this._closedViaCloseButton) {
            this._showExperienceImprove();
        } else {
            this._hide();
        }
    }

    _handleAcceptSelected() {
        this._logger.info('Accept selected clicked');
        const consent = this._collectSelectedConsent();
        this._saveConsent(consent);
        this._clearUnauthorizedCookies(consent);
        this._loadScripts(consent);

        const allSelected = this._areAllOptionalCategoriesSelected(consent);
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];

        // Показываем баннер только если пользователь не выбрал все опции 
        // И окно не было закрыто принудительно через кнопку закрытия
        if (modalSettings?.showExperienceImprove && !allSelected && !this._closedViaCloseButton) {
            this._showExperienceImprove();
        } else {
            this._hide();
        }
    }


    _handleKeepChoice() {
        this._logger.info('Keep choice clicked');
        this._hide();
    }

    _handleClose() {
        this._logger.info('Close clicked');

        // Если нет сохраненного согласия, сохраняем минимальные настройки
        if (!this._getStoredConsent()) {
            const minimalConsent = this._createConsentObject(false);
            this._saveConsent(minimalConsent);
            this._clearUnauthorizedCookies(minimalConsent);
            this._loadScripts(minimalConsent);
        }

        // Полностью скрываем модальное окно И оверлей
        this._hide();
    }

    /**
     * Открывает настройки
     */
    _openSettings() {
        this._logger.info('Opening settings');

        // Убеждаемся, что элементы созданы
        if (!this.notification || !this.overlay) {
            this._createElements();
        }

        this.currentModalType = this.config.modalTypes.MANUAL_SETTINGS;
        this._renderModal();
        this._show();
    }

    /**
     * Показывает баннер улучшения опыта
     */
    _showExperienceImprove() {
        this._logger.info('Showing experience improve banner');

        // Сначала скрываем текущее модальное окно
        this._hide();

        // Даем время на анимацию закрытия
        setTimeout(() => {
            this.currentModalType = this.config.modalTypes.EXPERIENCE_IMPROVE;
            this._renderModal();
            this._show();
        }, 300);
    }

    /**
     * Собирает выбранное согласие из чекбоксов
     */
    _collectSelectedConsent() {
        const consent = {
            is_cookies_accepted: 1,
            timestamp: Date.now()
        };

        Object.keys(this.config.categories).forEach(key => {
            const checkbox = this.notification.querySelector(`input[name="${key}"]`);
            consent[key] = checkbox ? checkbox.checked : (this.config.categories[key].required || false);
        });

        return consent;
    }

    /**
     * Проверяет, выбраны ли все опциональные категории
     */
    _areAllOptionalCategoriesSelected(consent) {
        return Object.entries(this.config.categories)
            .filter(([_, category]) => !category.required)
            .every(([key]) => consent[key]);
    }

    /**
     * Создает объект согласия
     */
    _createConsentObject(allAccepted = true) {
        const consent = {
            is_cookies_accepted: 1,
            timestamp: Date.now()
        };

        Object.entries(this.config.categories).forEach(([key, category]) => {
            consent[key] = allAccepted ? true : (category.required || false);
        });

        return consent;
    }

    /**
     * Сохраняет согласие
     */
    _saveConsent(consent) {
        this._logger.info('Saving consent:', consent);

        try {
            localStorage.setItem('cookieConsent', JSON.stringify(consent));

            // Отправляем событие
            this._sendGtmEvent(this.config.tagManagers.gtm.events.consent, { consent });
            window.dispatchEvent(new CustomEvent('cookieConsent', { detail: consent }));

        } catch (error) {
            this._logger.error('Failed to save consent:', error);
        }
    }

    /**
     * Получает сохраненное согласие
     */
    _getStoredConsent() {
        try {
            const data = localStorage.getItem('cookieConsent');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            this._logger.error('Failed to get stored consent:', error);
            return null;
        }
    }

    /**
     * Загружает скрипты на основе согласия
     */
    _loadScripts(consent) {
        this._logger.info('Loading scripts based on consent:', consent);

        Object.entries(consent).forEach(([category, isAllowed]) => {
            if (isAllowed && this.config.categories[category]?.scripts) {
                this._loadCategoryScripts(category);
            }
        });
    }

    /**
     * Загружает скрипты для категории
     */
    _loadCategoryScripts(category) {
        const scripts = this.config.categories[category]?.scripts || [];

        scripts.forEach(script => {
            if (!this._validateScript(script)) {
                this._logger.warn(`Invalid script for category ${category}:`, script);
                return;
            }

            switch (script.type) {
                case 'file':
                    this._loadFileScript(script.path);
                    break;
                case 'inline':
                    this._loadInlineScript(script.code);
                    break;
                case 'gtm':
                    this._sendGtmEvent(script.name, script.data);
                    break;
                case 'event':
                    this._triggerScriptEvent(script);
                    break;
            }
        });
    }

    /**
     * Загружает файловый скрипт
     */
    _loadFileScript(path) {
        const fullPath = path.startsWith('http') ? path : (path.startsWith('/') ? path : '/' + path);

        const script = document.createElement('script');
        script.src = fullPath;
        script.async = true;
        script.onerror = (error) => {
            this._logger.error(`Failed to load script ${fullPath}:`, error);
        };

        document.head.appendChild(script);
    }

    /**
     * Загружает встроенный скрипт
     */
    _loadInlineScript(code) {
        const script = document.createElement('script');
        script.textContent = code;
        document.head.appendChild(script);
    }

    /**
     * Запускает событие скрипта
     */
    _triggerScriptEvent(script) {
        const { name, data = {} } = script;

        // GTM
        if (this.config.tagManagers?.gtm?.enabled && typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: name,
                ...data,
                timestamp: new Date().toISOString()
            });
        }

        // Matomo
        if (this.config.tagManagers?.matomo?.enabled && typeof _paq !== 'undefined') {
            _paq.push(['trackEvent', 'CookieConsent', name, JSON.stringify(data)]);
        }

        // Кастомное событие
        window.dispatchEvent(new CustomEvent(`cookieConsent:${name}`, { detail: data }));
    }

    /**
     * Валидирует скрипт
     */
    _validateScript(script) {
        if (!script || typeof script !== 'object') return false;
        if (!['file', 'inline', 'event', 'gtm'].includes(script.type)) return false;

        if (script.type === 'file' && (!script.path || typeof script.path !== 'string')) {
            return false;
        }

        if (script.type === 'inline' && (!script.code || typeof script.code !== 'string')) {
            return false;
        }

        if ((script.type === 'event' || script.type === 'gtm') && !script.name) {
            return false;
        }

        return true;
    }

    /**
     * Очищает неавторизованные cookies
     */
    _clearUnauthorizedCookies(consent = {}) {
        const consentRequiredCookies = {
            analytics: ['_ym_uid', '_ym_d', '_ga', '_gid', '_gat'],
            marketing: ['_fbp', '_fbc'],
            functional: ['PHPSESSID']
        };

        const cookies = document.cookie.split(';');

        cookies.forEach(cookie => {
            const [name] = cookie.trim().split('=');
            let shouldDelete = false;

            Object.entries(consentRequiredCookies).forEach(([category, cookieList]) => {
                if (cookieList.includes(name) && !consent[category]) {
                    shouldDelete = true;
                }
            });

            if (shouldDelete) {
                this._deleteCookie(name);
            }
        });
    }

    /**
     * Удаляет cookie
     */
    _deleteCookie(name) {
        const domain = window.location.hostname;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain}`;
    }

    /**
     * Отправляет событие в GTM
     */
    _sendGtmEvent(eventName, data = {}) {
        if (this.config.tagManagers?.gtm?.enabled && typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: eventName,
                ...data,
                timestamp: new Date().toISOString()
            });
            this._logger.info(`GTM event sent: ${eventName}`, data);
        }
    }

    /**
     * Генерирует CSRF токен
     */
    _generateCsrfToken() {
        const array = new Uint32Array(8);
        crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    }

    /**
     * Получает сохраненный CSRF токен
     */
    _getStoredCsrfToken() {
        try {
            return localStorage.getItem('cookieConsentCsrf');
        } catch {
            return null;
        }
    }

    /**
     * Сохраняет CSRF токен
     */
    _storeCsrfToken(token) {
        try {
            localStorage.setItem('cookieConsentCsrf', token);
        } catch (error) {
            this._logger.warn('Could not store CSRF token:', error);
        }
    }

    /**
     * Добавляет заголовки безопасности на основе конфигурации
     */
    _addSecurityHeaders() {
        // Проверяем, включено ли добавление CSP заголовков
        if (!this.config.security?.enableCSP) {
            this._logger.info('CSP headers disabled in config');
            return;
        }

        const cspConfig = this.config.security.csp;
        if (!cspConfig) {
            this._logger.warn('CSP config not found');
            return;
        }

        // Строим CSP строку из конфигурации
        const cspDirectives = [];

        Object.entries(cspConfig).forEach(([directive, sources]) => {
            if (Array.isArray(sources) && sources.length > 0) {
                cspDirectives.push(`${directive} ${sources.join(' ')}`);
            }
        });

        if (cspDirectives.length === 0) {
            this._logger.warn('No CSP directives found in config');
            return;
        }

        const cspContent = cspDirectives.join('; ');

        // Проверяем, не добавлен ли уже CSP заголовок
        const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingMeta) {
            this._logger.info('CSP header already exists, skipping');
            return;
        }

        // Создаем и добавляем meta тег с CSP
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = cspContent;
        document.head.appendChild(meta);

        this._logger.info('CSP header added:', cspContent);
    }

    /**
     * Экранирует HTML-символы для предотвращения XSS
     */
    _escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Безопасно обрабатывает HTML в описании
     */
    _sanitizeHtml(html) {
        if (!html || typeof html !== 'string') {
            this._logger.warn('_sanitizeHtml: empty or invalid html:', html);
            return '';
        }

        this._logger.info('_sanitizeHtml input:', html);

        try {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            const allowedTags = ['a', 'strong', 'em', 'br', 'p', 'span'];
            const allowedAttributes = {
                'a': ['href', 'class', 'target', 'rel'],
                'span': ['class']
            };

            const sanitizeAttributes = (element) => {
                if (!element || !element.attributes) return;

                const attributes = Array.from(element.attributes);
                attributes.forEach(attr => {
                    const tagName = element.tagName.toLowerCase();
                    const allowedForTag = allowedAttributes[tagName] || [];

                    if (!allowedForTag.includes(attr.name)) {
                        this._logger.info(`Removing attribute ${attr.name} from ${tagName}`);
                        element.removeAttribute(attr.name);
                    } else if (attr.name === 'href') {
                        const href = attr.value.toLowerCase();
                        if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('/') && !href.startsWith('#')) {
                            this._logger.info(`Removing invalid href: ${attr.value}`);
                            element.removeAttribute('href');
                        }
                    }
                });
            };

            const sanitizeNode = (node) => {
                if (!node) return;

                if (node.nodeType === Node.TEXT_NODE) {
                    return; // Текстовые узлы оставляем как есть
                }

                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();

                    if (!allowedTags.includes(tagName)) {
                        this._logger.info(`Removing disallowed tag: ${tagName}`);
                        // Заменяем тег на его содержимое
                        const fragment = document.createDocumentFragment();
                        while (node.firstChild) {
                            fragment.appendChild(node.firstChild);
                        }
                        if (node.parentNode) {
                            node.parentNode.replaceChild(fragment, node);
                        }
                        return;
                    }

                    sanitizeAttributes(node);
                }

                // Рекурсивно обрабатываем дочерние элементы
                const childNodes = Array.from(node.childNodes || []);
                childNodes.forEach(sanitizeNode);
            };

            // Обрабатываем все дочерние элементы
            const childNodes = Array.from(temp.childNodes);
            childNodes.forEach(sanitizeNode);

            const result = temp.innerHTML;

            this._logger.info('_sanitizeHtml result:', result);
            return result;
        } catch (error) {
            this._logger.error('Error sanitizing HTML:', error);
            const fallback = this._escapeHtml(html);
            this._logger.info('_sanitizeHtml fallback result:', fallback);
            return fallback;
        }
    }

    /**
     * Оборачивает текст в параграфы с поддержкой HTML
     */
    _wrapTextInParagraphs(text) {
        if (!text || typeof text !== 'string') {
            this._logger.warn('_wrapTextInParagraphs: empty or invalid text:', text);
            return '';
        }

        this._logger.info('_wrapTextInParagraphs input:', text);

        try {
            // Разделяем текст по переносам строк
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length === 0) return '';

            this._logger.info('Split lines:', lines);

            // Обрабатываем каждую строку отдельно
            const paragraphs = lines.map(line => {
                const trimmedLine = line.trim();

                if (/<[^>]*>/.test(trimmedLine)) {
                    // Строка содержит HTML - санитизируем
                    const sanitized = this._sanitizeHtml(trimmedLine);
                    this._logger.info(`Line with HTML: "${trimmedLine}" -> "${sanitized}"`);
                    return `<p>${sanitized}</p>`;
                } else {
                    // Обычный текст - экранируем
                    const escaped = this._escapeHtml(trimmedLine);
                    this._logger.info(`Plain text line: "${trimmedLine}" -> "${escaped}"`);
                    return `<p>${escaped}</p>`;
                }
            }).filter(p => p !== '<p></p>'); // Убираем пустые параграфы

            const result = paragraphs.join('');
            this._logger.info('Final paragraphs result:', result);

            return result;
        } catch (error) {
            this._logger.error('Error in _wrapTextInParagraphs:', error);
            // Fallback - весь текст в одном параграфе
            return `<p>${this._escapeHtml(text)}</p>`;
        }
    }


    // Публичные статические методы API
    static init(options = {}) {
        if (!this.instance) {
            this.instance = new CookieConsent(options);
        }
        return this.instance;
    }

    static hasConsent(category) {
        if (!this.instance) {
            return category === 'necessary';
        }
        const consent = this.instance._getStoredConsent();
        if (category === 'necessary') {
            return true;
        }
        return consent?.[category] || false;
    }

    static getConsent() {
        if (!this.instance) {
            return { necessary: true };
        }
        const consent = this.instance._getStoredConsent() || {};
        consent.necessary = true; // Необходимые куки всегда включены
        return consent;
    }

    static openSettings() {
        if (this.instance) {
            this.instance._openSettings();
        }
    }

    static show() {
        if (this.instance) {
            this.instance._show();
        }
    }

    static hide() {
        if (this.instance) {
            this.instance._hide();
        }
    }
}

/**
 * Класс для логирования
 */
class Logger {
    constructor(context) {
        this.context = context;
        this.isDebugEnabled = typeof window !== 'undefined' && window.__COOKIE_CONSENT_DEBUG__ === true;
    }

    info(message, data) {
        if (!this.isDebugEnabled) return;
        console.log(`[${this.context}] ${message}`, data || '');
    }

    warn(message, data) {
        if (!this.isDebugEnabled) return;
        console.warn(`[${this.context}] ${message}`, data || '');
    }

    error(message, data) {
        if (this.isDebugEnabled) {
            console.error(`[${this.context}] ${message}`, data || '');
        }
        if (typeof window !== 'undefined' && window.__COOKIE_CONSENT_ERROR_HANDLER__) {
            window.__COOKIE_CONSENT_ERROR_HANDLER__(message, data);
        }
    }
}

// Экспорт для глобального использования
window.CookieConsent = CookieConsent;