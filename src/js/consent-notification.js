import { cookieConsentConfig } from './cookie-consent-config.js';

/**
 * @typedef {Object} CookieConsentConfig
 * @property {Object} modalTypes - Типы модальных окон
 * @property {Object} visual - Визуальные настройки
 * @property {Object} categories - Категории cookie
 * @property {Object} texts - Тексты для интерфейса
 * @property {Object} tagManagers - Настройки для отправки событий в GTM и Matomo
 */

/**
 * @typedef {Object} ModalSettings
 * @property {string} position - Позиция модального окна ('top' | 'bottom' | 'center')
 * @property {string} maxWidth - Максимальная ширина
 * @property {boolean} showOverlay - Показывать ли оверлей
 * @property {boolean} allowClose - Разрешить ли закрытие
 * @property {boolean} closeOnOverlayClick - Закрывать ли при клике на оверлей
 * @property {string} animation - Тип анимации
 * @property {boolean} preventScroll - Блокировать ли скролл
 * @property {boolean} showExperienceImprove - Показывать ли баннер улучшения опыта
 */

/**
 * @typedef {Object} ConsentData
 * @property {boolean} necessary - Необходимые cookie
 * @property {boolean} analytics - Аналитические cookie
 * @property {boolean} marketing - Маркетинговые cookie
 * @property {boolean} functional - Функциональные cookie
 */

/**
 * Класс для управления уведомлениями о cookie
 * @class ConsentNotification
 */
export class ConsentNotification {
    /**
     * Создает экземпляр ConsentNotification
     * @param {Object} config - Конфигурация
     * @param {Object} [config.visual] - Визуальные настройки
     * @param {Object} [config.categories] - Категории cookie
     * @param {Object} [config.texts] - Тексты для интерфейса
     * @param {boolean} [config.simpleMode=false] - Простой режим работы
     * @throws {Error} Если экземпляр уже существует
     */
    constructor(config = {}) {
        this._logger = new Logger('ConsentNotification');
        this._logger.info('Initializing consent notification');

        // Получаем существующий CSRF токен или генерируем новый
        this._csrfToken = localStorage.getItem('cookieConsentCsrf') || this._generateCsrfToken();
        localStorage.setItem('cookieConsentCsrf', this._csrfToken);

        // Проверяем, не существует ли уже экземпляр
        if (window.cookieConsentInstance) {
            const error = new Error('ConsentNotification instance already exists');
            this._logger.error(error);
            throw error;
        }
        window.cookieConsentInstance = this;

        // Добавляем заголовки безопасности
        this._addSecurityHeaders();

        this._initializeState();
        this._initializeConfig(config);
        this._initialize();
    }

    /**
     * Инициализирует состояние компонента
     * @private
     */
    _initializeState() {
        this.notification = null;
        this.overlay = null;
        this.isVisible = false;
        this.isOverlayVisible = false;
        this.isSettingsVisible = false;
        this.pendingConsent = null;
        this.currentModalType = null;
        this.isSimpleMode = false;
        this._scrollPosition = null;
    }

    /**
     * Инициализирует конфигурацию
     * @param {Object} config - Пользовательская конфигурация
     * @private
     */
    _initializeConfig(config) {
        try {
            this.isSimpleMode = config.simpleMode || false;
            
            this.config = {
                modalTypes: cookieConsentConfig.modalTypes,
                visual: { ...cookieConsentConfig.visual, ...config.visual },
                categories: { ...cookieConsentConfig.categories, ...config.categories },
                texts: { ...cookieConsentConfig.texts, ...config.texts },
                tagManagers: { ...cookieConsentConfig.tagManagers, ...config.tagManagers }
            };
            this._validateConfig();
        } catch (error) {
            this._logger.error('Failed to initialize config:', error);
            throw error;
        }
    }

    /**
     * Валидирует конфигурацию
     * @private
     * @throws {Error} Если конфигурация некорректна
     */
    _validateConfig() {
        const requiredFields = ['modalTypes', 'visual', 'categories', 'texts', 'tagManagers'];
        const missingFields = requiredFields.filter(field => !this.config[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required config fields: ${missingFields.join(', ')}`);
        }

        // Проверяем наличие необходимых категорий
        if (!this.config.categories.necessary) {
            throw new Error('Necessary category is required in config');
        }

        // Проверяем наличие необходимых текстов
        const requiredTexts = ['mainBanner', 'experienceImprove', 'settings', 'simpleNotification'];
        const missingTexts = requiredTexts.filter(text => !this.config.texts[text]);
        
        if (missingTexts.length > 0) {
            throw new Error(`Missing required text fields: ${missingTexts.join(', ')}`);
        }

        // Проверяем настройки GTM
        if (this.config.tagManagers.gtm?.enabled) {
            if (!this.config.tagManagers.gtm.id) {
                throw new Error('GTM ID is required when GTM is enabled');
            }
            if (!this.config.tagManagers.gtm.events) {
                throw new Error('GTM events configuration is required when GTM is enabled');
            }
            if (!this.config.tagManagers.gtm.dataLayer) {
                throw new Error('GTM dataLayer name is required when GTM is enabled');
            }
        }
    }

    /**
     * Инициализирует компонент
     * @private
     */
    _initialize() {
        try {
            const savedConsent = this._secureStorageGet('cookieConsent');
            this._logger.info('Retrieved saved consent:', savedConsent);
            
            if (savedConsent) {
                this._logger.info('Checking consent validity:', {
                    is_cookies_accepted: savedConsent.is_cookies_accepted,
                    timestamp: savedConsent.timestamp,
                    currentTime: Date.now(),
                    diff: Date.now() - savedConsent.timestamp
                });

                if (savedConsent.is_cookies_accepted === 1 && 
                    (!savedConsent.timestamp || Date.now() - savedConsent.timestamp <= 24 * 60 * 60 * 1000)) {
                    this._logger.info('Found valid saved consent, loading scripts');
                    this._clearUnauthorizedCookies();
                    this._cookiesCleared = true;
                    this.loadScripts(savedConsent);
                    return;
                } else {
                    this._logger.info('Consent invalid or expired:', {
                        is_cookies_accepted: savedConsent.is_cookies_accepted,
                        isExpired: savedConsent.timestamp ? Date.now() - savedConsent.timestamp > 24 * 60 * 60 * 1000 : true
                    });
                }
            }

            this._logger.info('No valid consent found, showing banner');
            this.createElements();
            
            if (this.isSimpleMode) {
                const allConsent = this._createConsentObject(true);
                this._logger.info('Simple mode: loading all scripts with consent:', allConsent);
                this._clearUnauthorizedCookies();
                this._cookiesCleared = true;
                this.loadScripts(allConsent);
                this._secureStorageSet('cookieConsent', allConsent);
                
                this.currentModalType = this.config.modalTypes.SIMPLE_NOTIFICATION;
                this.renderModal(this.currentModalType);
            } else {
                this.currentModalType = this.config.modalTypes.INITIAL;
                this.renderModal(this.currentModalType);
            }
        } catch (error) {
            this._logger.error('Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Создает DOM элементы
     * @private
     * @throws {Error} Если элементы уже существуют
     */
    createElements() {
        try {
            if (document.querySelector('.cookie-consent')) {
                const error = new Error('Cookie consent elements already exist');
                this._logger.warn(error);
                document.querySelector('.cookie-consent')?.remove();
                document.querySelector('.cookie-consent-overlay')?.remove();
            }

            this._createOverlay();
            this._createNotification();
            this._logger.info('Elements created and added to DOM');
        } catch (error) {
            this._logger.error('Failed to create elements:', error);
            throw error;
        }
    }

    /**
     * Создает оверлей
     * @private
     */
    _createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'cookie-consent-overlay';
        this.overlay.style.setProperty('--cookie-consent-blur', this.config.visual.overlay.blur);
        this.overlay.style.setProperty('--cookie-consent-overlay-color', this.config.visual.overlay.color);
        this.overlay.style.setProperty('--cookie-consent-overlay-z-index', this.config.visual.overlay.zIndex);
        document.body.appendChild(this.overlay);
    }

    /**
     * Создает уведомление
     * @private
     */
    _createNotification() {
        this.notification = document.createElement('div');
        this.notification.className = 'cookie-consent';
        this.notification.style.setProperty('--cookie-consent-z-index', this.config.visual.modal.zIndex);
        this.notification.style.setProperty('--cookie-consent-max-width', this.config.visual.modal.maxWidth);
        this.notification.style.setProperty('--cookie-consent-border-radius', this.config.visual.modal.borderRadius);
        this.notification.style.setProperty('--cookie-consent-box-shadow', this.config.visual.modal.boxShadow);
        document.body.appendChild(this.notification);
    }

    addEventListeners() {
        this._logger.info('ConsentNotification: addEventListeners called');
        
        // Удаляем все старые обработчики через клонирование элементов
        const removeOldListeners = (selector) => {
            const elements = this.notification.querySelectorAll(selector);
            elements.forEach(element => {
                const clone = element.cloneNode(true);
                element.parentNode.replaceChild(clone, element);
            });
        };

        // Удаляем старые обработчики для всех кнопок и ссылок
        removeOldListeners('button');
        removeOldListeners('.cookie-consent__link--settings');
        removeOldListeners('.cookie-consent__checkbox input[type="checkbox"]');
        removeOldListeners('.cookie-consent__close-button');

        // Добавляем обработчики только для существующих элементов
        const handlers = {
            '.cookie-consent__button--all': () => {
                this._logger.info('Accept all clicked');
                this.handleAcceptAll();
            },
            '.cookie-consent__button--necessary': () => {
                this._logger.info('Accept necessary clicked');
                this.handleAcceptNecessary();
            },
            '.cookie-consent__button--selected': () => {
                this._logger.info('Accept selected clicked');
                this.handleAcceptSelected();
            },
            '.cookie-consent__link--settings': (e) => {
                e.preventDefault();
                this._logger.info('Settings link clicked');
                this.openSettings('link');
            },
            '.cookie-consent__close-button': () => {
                this._logger.info('Close clicked');
                this.hide();
            },
            '.cookie-consent__checkbox input[type="checkbox"]': (e) => {
                this._logger.info('Checkbox changed:', e.target.name, e.target.checked);
                this.handleCheckboxChange();
            }
        };

        // Добавляем только существующие обработчики
        Object.entries(handlers).forEach(([selector, handler]) => {
            const elements = this.notification.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(element => {
                    element.addEventListener('click', handler);
                });
            }
        });

        // Обработчик для оверлея
        if (this.overlay && this.config.visual.allowClose) {
            this.overlay.removeEventListener('click', this._overlayHandler);
            this.overlay.addEventListener('click', this._overlayHandler);
        }

        this._logger.info('ConsentNotification: Event listeners added');
    }

    handleCheckboxChange() {
        this._logger.info('ConsentNotification: handleCheckboxChange called');
        // Убираем немедленное сохранение настроек
        // Теперь настройки будут сохраняться только после нажатия кнопки
    }

    render() {
        this._logger.info('ConsentNotification: render called');
        // Проверяем, не было ли уже сохранено согласие
        const savedConsent = this._secureStorageGet('cookieConsent');
        if (savedConsent && savedConsent.is_cookies_accepted === 1) {
            this._logger.info('ConsentNotification: Valid consent already saved, not showing banner');
            return;
        }

        this.currentModalType = this.config.modalTypes.INITIAL;
        this.renderModal(this.currentModalType);
    }

    renderModal(modalType) {
        this._logger.info(`ConsentNotification: Rendering modal type: ${modalType}`);
        
        // Убедимся, что элементы созданы
        if (!this.notification || !this.overlay) {
            this.createElements();
        }
        
        // Получаем настройки для текущего типа модального окна
        const modalSettings = this.config.visual.modalTypes[modalType];
        if (!modalSettings) {
            this._logger.warn(`Modal settings not found for type: ${modalType}`);
            return;
        }
        
        // Сбрасываем все классы позиционирования и анимации
        this.notification.classList.remove(
            'cookie-consent--secondary',
            'cookie-consent--top',
            'cookie-consent--bottom',
            'cookie-consent--fade',
            'cookie-consent--slide',
            'cookie-consent--visible'
        );

        // Применяем настройки позиционирования
        if (modalSettings.position === 'top') {
            this.notification.classList.add('cookie-consent--top');
        } else if (modalSettings.position === 'bottom') {
            this.notification.classList.add('cookie-consent--bottom');
        }

        // Применяем настройки анимации
        if (modalSettings.animation !== 'none') {
            this.notification.classList.add(`cookie-consent--${modalSettings.animation}`);
        }

        // Применяем максимальную ширину
        this.notification.style.setProperty('--cookie-consent-max-width', modalSettings.maxWidth);

        // Настраиваем оверлей
        if (modalSettings.showOverlay) {
            this.overlay.style.display = 'block';
            this.overlay.style.opacity = '0';
            this.overlay.style.visibility = 'hidden';
        } else {
            this.overlay.style.display = 'none';
            this.overlay.style.opacity = '0';
            this.overlay.style.visibility = 'hidden';
        }

        // Рендерим содержимое модального окна
        try {
            switch (modalType) {
                case this.config.modalTypes.INITIAL:
                    this.renderInitialModal();
                    break;
                case this.config.modalTypes.FIRST_VISIT_SETTINGS:
                    this.renderFirstVisitSettingsModal();
                    break;
                case this.config.modalTypes.EXPERIENCE_IMPROVE:
                    this.renderExperienceImproveModal();
                    break;
                case this.config.modalTypes.MANUAL_SETTINGS:
                    this.renderManualSettingsModal();
                    break;
                case this.config.modalTypes.SIMPLE_NOTIFICATION:
                    this.renderSimpleNotification();
                    break;
                default:
                    this._logger.warn(`Unknown modal type: ${modalType}`);
                    return;
            }

            // Добавляем кнопку закрытия если разрешено
            if (modalSettings.allowClose) {
                const closeButton = this.notification.querySelector('.cookie-consent__close-button');
                if (!closeButton) {
                    const content = this.notification.querySelector('.cookie-consent__content');
                    if (content) {
                        content.insertAdjacentHTML('afterbegin', 
                            '<button class="cookie-consent__close-button" aria-label="Закрыть"></button>'
                        );
                    }
                }
            } else {
                const closeButton = this.notification.querySelector('.cookie-consent__close-button');
                if (closeButton) {
                    closeButton.remove();
                }
            }

            this.currentModalType = modalType;
            
            // Показываем модальное окно после рендеринга
            requestAnimationFrame(() => {
                this.show();
            });
        } catch (error) {
            this._logger.error('Error rendering modal:', error);
        }
    }

    /**
     * Экранирует HTML-символы для предотвращения XSS
     * @param {string} str - Строка для экранирования
     * @returns {string} Экранированная строка
     * @private
     */
    _escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Безопасно обрабатывает HTML в описании, разрешая только определенные теги
     * @param {string} html - HTML строка для обработки
     * @returns {string} Обработанная HTML строка
     * @private
     */
    _sanitizeHtml(html) {
        if (!html || typeof html !== 'string') return '';
        
        try {
            // Создаем временный элемент для парсинга HTML
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Разрешенные теги и атрибуты
            const allowedTags = ['a', 'strong', 'em', 'br', 'p'];
            const allowedAttributes = {
                'a': ['href', 'class', 'target', 'rel']
            };

            // Функция для очистки атрибутов
            const sanitizeAttributes = (element) => {
                if (!element || !element.attributes) return;
                
                const attributes = Array.from(element.attributes);
                attributes.forEach(attr => {
                    const tagName = element.tagName.toLowerCase();
                    if (!allowedAttributes[tagName]?.includes(attr.name)) {
                        element.removeAttribute(attr.name);
                    }
                    // Дополнительная проверка для href
                    if (attr.name === 'href') {
                        const href = attr.value.toLowerCase();
                        if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('/')) {
                            element.removeAttribute('href');
                        }
                    }
                });
            };

            // Рекурсивно обрабатываем все элементы
            const sanitizeNode = (node) => {
                if (!node) return;
                
                if (node.nodeType === Node.TEXT_NODE) {
                    return;
                }

                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    
                    if (!allowedTags.includes(tagName)) {
                        // Если тег не разрешен, заменяем его содержимым
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

            sanitizeNode(temp);
            return temp.innerHTML;
        } catch (error) {
            this._logger.error('Error sanitizing HTML:', error);
            // В случае ошибки возвращаем экранированный текст
            return this._escapeHtml(html);
        }
    }

    /**
     * Оборачивает текст в параграфы
     * @param {string} text - Текст для обработки
     * @returns {string} HTML с параграфами
     */
    wrapTextInParagraphs(text) {
        if (!text || typeof text !== 'string') return '';
        
        try {
            // Разбиваем текст на параграфы по переносу строки
            const paragraphs = text.split('\n').filter(p => p.trim());
            
            // Если параграфов нет, возвращаем пустую строку
            if (paragraphs.length === 0) return '';
            
            // Обрабатываем каждый параграф
            return paragraphs
                .map(p => {
                    // Если параграф содержит HTML, санитизируем его
                    if (/<[^>]*>/.test(p)) {
                        return `<p>${this._sanitizeHtml(p)}</p>`;
                    }
                    // Если это простой текст, просто экранируем его
                    return `<p>${this._escapeHtml(p)}</p>`;
                })
                .join('');
        } catch (error) {
            this._logger.error('Error wrapping text in paragraphs:', error);
            // В случае ошибки возвращаем экранированный текст в одном параграфе
            return `<p>${this._escapeHtml(text)}</p>`;
        }
    }

    /**
     * Рендерит описание
     * @param {string} description - Текст описания
     * @returns {string} HTML описание
     */
    renderDescription(description) {
        if (!description || typeof description !== 'string') {
            this._logger.warn('Invalid description provided');
            return '';
        }

        try {
            return `
                <div class="cookie-consent__description">
                    ${this.wrapTextInParagraphs(description)}
                </div>
            `;
        } catch (error) {
            this._logger.error('Error rendering description:', error);
            return '';
        }
    }

    // Обновляем метод renderTitle для использования экранирования
    renderTitle(title) {
        return `<h2 class="cookie-consent__title">${this._escapeHtml(title)}</h2>`;
    }

    // Вспомогательные методы для рендеринга
    renderCloseButton() {
        return this.config.visual.modal.allowClose 
            ? '<button class="cookie-consent__close-button" aria-label="Закрыть"></button>' 
            : '';
    }

    renderContent(content, modalType = this.currentModalType) {
        // Получаем настройки для указанного типа модального окна
        const modalSettings = this.config.visual.modalTypes[modalType];
        
        // Если настройки не найдены, возвращаем контент как есть
        if (!modalSettings) {
            this._logger.warn(`Modal settings not found for type: ${modalType}`);
            return content;
        }

        const isInline = modalSettings.position === 'top' || modalSettings.position === 'bottom';
        
        if (isInline) {
            return `
                <div>
                    ${content}
                </div>
            `;
        }
        return content;
    }

    renderButtons(buttons) {
        return `
            <div class="cookie-consent__buttons">
                ${buttons}
            </div>
        `;
    }

    // Методы для рендеринга кнопок
    renderAcceptAllButton(text, className = 'cookie-consent__button--all') {
        return `<button class="cookie-consent__button ${className}">${text}</button>`;
    }

    renderAcceptNecessaryButton(text, className = 'cookie-consent__button--necessary') {
        return `<button class="cookie-consent__button ${className}">${text}</button>`;
    }

    renderSettingsLink(text) {
        return `<a href="#" class="cookie-consent__link cookie-consent__link--settings">${text}</a>`;
    }

    renderAcceptSelectedButton(text) {
        return `<button class="cookie-consent__button cookie-consent__button--selected">${text}</button>`;
    }

    // Методы для рендеринга категорий
    renderCategory(key, category, isChecked = false) {
        return `
            <div class="cookie-consent__category">
                <label class="cookie-consent__checkbox">
                    <input type="checkbox" name="${this._escapeHtml(key)}" 
                        ${category.required ? 'checked disabled' : ''} 
                        ${isChecked ? 'checked' : ''}>
                    <div>
                        <div class="cookie-consent__category-title">${this._escapeHtml(category.title)}</div>
                        <div class="cookie-consent__category-description">
                            ${this.wrapTextInParagraphs(category.description)}
                        </div>
                    </div>
                </label>
            </div>
        `;
    }

    renderCategories(categories, savedConsent = {}) {
        return `
            <div class="cookie-consent__categories cookie-consent__categories--visible">
                ${Object.entries(categories).map(([key, category]) => 
                    this.renderCategory(key, category, savedConsent[key])
                ).join('')}
            </div>
        `;
    }

    /**
     * Рендерит содержимое модального окна
     * @param {string} content - HTML содержимое
     * @param {string} buttons - HTML кнопок
     * @param {string} modalType - Тип модального окна
     * @private
     */
    _renderModalContent(content, buttons, modalType) {
        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                ${this.renderCloseButton()}
                ${this.renderContent(content, modalType)}
                ${this.renderButtons(buttons)}
            </div>
        `;
    }

    renderInitialModal() {
        const content = `
            ${this.renderTitle(this.config.texts.mainBanner.title)}
            ${this.renderDescription(this.config.texts.mainBanner.description)}
        `;

        const buttons = `
            ${this.renderAcceptAllButton(this.config.texts.mainBanner.acceptAll)}
            ${this.renderAcceptNecessaryButton(this.config.texts.mainBanner.acceptNecessary)}
            ${this.renderSettingsLink(this.config.texts.mainBanner.settings)}
        `;

        this._renderModalContent(content, buttons, this.config.modalTypes.INITIAL);
    }

    renderFirstVisitSettingsModal() {
        const content = `
            ${this.renderTitle(this.config.texts.mainBanner.title)}
            ${this.renderDescription(this.config.texts.mainBanner.description)}
            ${this.renderCategories(this.config.categories)}
        `;

        const buttons = `
            ${this.renderAcceptAllButton(this.config.texts.settings.acceptAll)}
            ${this.renderAcceptSelectedButton(this.config.texts.settings.acceptSelected)}
        `;

        this._renderModalContent(content, buttons, this.config.modalTypes.FIRST_VISIT_SETTINGS);
        this.isSettingsVisible = true;
    }

    renderExperienceImproveModal() {
        const content = `
            ${this.renderTitle(this.config.texts.experienceImprove.title)}
            ${this.renderDescription(this.config.texts.experienceImprove.description)}
        `;

        const buttons = `
            ${this.renderAcceptAllButton(this.config.texts.experienceImprove.acceptAll)}
            ${this.renderAcceptNecessaryButton(
                this.config.texts.experienceImprove.keepChoice,
                'cookie-consent__button--close'
            )}
        `;

        this._logger.info('Rendering EXPERIENCE_IMPROVE modal with buttons:', {
            acceptAll: this.config.texts.experienceImprove.acceptAll,
            keepChoice: this.config.texts.experienceImprove.keepChoice
        });

        this._renderModalContent(content, buttons, this.config.modalTypes.EXPERIENCE_IMPROVE);
        
        // Добавляем проверку после рендеринга
        const keepChoiceBtn = this.notification.querySelector('.cookie-consent__button--necessary.cookie-consent__button--close');
        this._logger.info('Keep choice button after render:', {
            exists: !!keepChoiceBtn,
            classes: keepChoiceBtn ? keepChoiceBtn.className : null,
            text: keepChoiceBtn ? keepChoiceBtn.textContent : null
        });
    }

    renderManualSettingsModal() {
        this._logger.info('Rendering manual settings modal');
        this.isSettingsVisible = false;
        this.currentModalType = this.config.modalTypes.MANUAL_SETTINGS;
        
        const savedConsent = this._secureStorageGet('cookieConsent') || {};
        this._logger.info('Current saved consent:', savedConsent);
        
        const content = `
            ${this.renderTitle(this.config.texts.mainBanner.title)}
            ${this.renderDescription(this.config.texts.mainBanner.description)}
            ${this.renderCategories(this.config.categories, savedConsent)}
        `;

        const buttons = `
            ${this.renderAcceptAllButton(this.config.texts.settings.acceptAll)}
            ${this.renderAcceptSelectedButton(this.config.texts.settings.acceptSelected)}
        `;

        this._renderModalContent(content, buttons, this.config.modalTypes.MANUAL_SETTINGS);
        this.isSettingsVisible = true;
        this._logger.info('Manual settings modal rendered');
    }

    renderSimpleNotification() {
        const content = `
            ${this.renderTitle(this.config.texts.simpleNotification.title)}
            ${this.renderDescription(this.config.texts.simpleNotification.description)}
        `;

        const buttons = `
            ${this.renderAcceptAllButton(
                this.config.texts.simpleNotification.acceptButton,
                'cookie-consent__button--accept'
            )}
        `;

        this._renderModalContent(content, buttons, this.config.modalTypes.SIMPLE_NOTIFICATION);
    }

    /**
     * Открывает настройки cookie
     * @param {string} [source='manual'] - Источник открытия настроек
     */
    openSettings(source = 'manual') {
        this._logger.info(`Opening settings from ${source}`);
        if (!this.notification) {
            this.createElements();
        }
        this.renderModal(this.config.modalTypes.MANUAL_SETTINGS);
    }

    showExperienceImprove() {
        this._logger.info('Showing experience improve banner');
        // Сбрасываем состояние перед показом
        this.isSettingsVisible = false;
        this.currentModalType = this.config.modalTypes.EXPERIENCE_IMPROVE;
        
        // Убедимся, что элементы созданы
        if (!this.notification || !this.overlay) {
            this.createElements();
        }

        // Проверяем, не видно ли уже модальное окно
        if (this.isVisible) {
            this._logger.info('Modal is already visible, hiding it first');
            this.hide();
            // Даем время на анимацию закрытия
            setTimeout(() => {
                this.renderModal(this.config.modalTypes.EXPERIENCE_IMPROVE);
                this._addExperienceImproveHandlers();
            }, 300);
        } else {
            this.renderModal(this.config.modalTypes.EXPERIENCE_IMPROVE);
            this._addExperienceImproveHandlers();
        }
    }

    // Новый метод для добавления обработчиков EXPERIENCE_IMPROVE
    _addExperienceImproveHandlers() {
        this._logger.info('Adding EXPERIENCE_IMPROVE handlers');
        
        // Удаляем старые обработчики через клонирование
        const removeOldListeners = (selector) => {
            const elements = this.notification.querySelectorAll(selector);
            this._logger.info(`Removing old listeners for ${selector}:`, {
                count: elements.length,
                elements: Array.from(elements).map(el => ({
                    classes: el.className,
                    text: el.textContent
                }))
            });
            elements.forEach(element => {
                const clone = element.cloneNode(true);
                element.parentNode.replaceChild(clone, element);
            });
        };

        // Удаляем старые обработчики для кнопок EXPERIENCE_IMPROVE
        removeOldListeners('.cookie-consent__button--all');
        removeOldListeners('.cookie-consent__button--necessary.cookie-consent__button--close');

        // Добавляем новые обработчики
        const acceptAllBtn = this.notification.querySelector('.cookie-consent__button--all');
        const keepChoiceBtn = this.notification.querySelector('.cookie-consent__button--necessary.cookie-consent__button--close');

        this._logger.info('Found buttons:', {
            acceptAll: {
                exists: !!acceptAllBtn,
                classes: acceptAllBtn ? acceptAllBtn.className : null,
                text: acceptAllBtn ? acceptAllBtn.textContent : null
            },
            keepChoice: {
                exists: !!keepChoiceBtn,
                classes: keepChoiceBtn ? keepChoiceBtn.className : null,
                text: keepChoiceBtn ? keepChoiceBtn.textContent : null
            }
        });

        if (acceptAllBtn) {
            this._logger.info('EXPERIENCE_IMPROVE: Adding accept all handler');
            acceptAllBtn.addEventListener('click', () => {
                this._logger.info('EXPERIENCE_IMPROVE: Accept all clicked');
                // Проставляем все категории true
                const consent = {
                    is_cookies_accepted: 1,
                    ...Object.entries(this.config.categories).reduce((acc, [key, category]) => {
                        if (category && category.scripts) {
                            acc[key] = true;
                        }
                        return acc;
                    }, {})
                };
                this.saveConsent(consent);
                if (this._pendingReload) {
                    this._logger.info('Reloading page after EXPERIENCE_IMPROVE (accept all)');
                    window.location.reload();
                } else {
                    this.hide();
                }
            });
        }

        if (keepChoiceBtn) {
            this._logger.info('EXPERIENCE_IMPROVE: Adding keep choice handler');
            keepChoiceBtn.addEventListener('click', (e) => {
                this._logger.info('EXPERIENCE_IMPROVE: Keep choice clicked', {
                    target: e.target,
                    currentTarget: e.currentTarget,
                    classes: e.currentTarget.className
                });
                if (this._pendingReload) {
                    this._logger.info('Reloading page after EXPERIENCE_IMPROVE (keep choice)');
                    window.location.reload();
                } else {
                    this.hide();
                }
            });
        } else {
            this._logger.warn('EXPERIENCE_IMPROVE: Keep choice button not found');
            // Попробуем найти кнопку с другими селекторами для диагностики
            const allButtons = this.notification.querySelectorAll('button');
            this._logger.info('All buttons in modal:', Array.from(allButtons).map(btn => ({
                classes: btn.className,
                text: btn.textContent
            })));
        }
    }

    show() {
        this._logger.info('ConsentNotification: show called');
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        if (!modalSettings) {
            this._logger.warn('Modal settings not found for current type');
            return;
        }

        // Убедимся, что элементы созданы
        if (!this.notification || !this.overlay) {
            this.createElements();
        }
        
        // Добавляем класс видимости
        this.notification.classList.add('cookie-consent--visible');
        
        // Применяем настройки оверлея
        if (modalSettings.showOverlay) {
            this.overlay.style.display = 'block';
            // Добавляем небольшую задержку для анимации
            requestAnimationFrame(() => {
                this.overlay.style.opacity = '1';
                this.overlay.style.visibility = 'visible';
            });
        }
        
        this.isVisible = true;
        this.isOverlayVisible = modalSettings.showOverlay;

        // Блокируем скроллинг если это требуется для текущего типа модального окна
        if (modalSettings.preventScroll) {
            this._scrollPosition = window.pageYOffset;
            document.body.classList.add('cookie-consent-no-scroll');
            document.body.style.top = `-${this._scrollPosition}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }

        // Добавляем обработчики событий после показа
        this.addEventListeners();
    }

    hide() {
        this._logger.info('ConsentNotification: hide called');
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        if (!modalSettings) {
            this._logger.warn('Modal settings not found for current type');
            return;
        }
        
        // Проверяем, было ли закрытие через кнопку закрытия
        const closeButton = this.notification.querySelector('.cookie-consent__close-button');
        const wasClosedByButton = closeButton && document.activeElement === closeButton;
        
        // Если закрытие произошло через кнопку закрытия и нет сохраненных настроек
        if (wasClosedByButton && !this._secureStorageGet('cookieConsent')) {
            this._logger.info('Modal closed via close button, accepting minimal permissions');
            const minimalConsent = {
                is_cookies_accepted: 1,
                ...Object.entries(this.config.categories).reduce((consent, [key, category]) => {
                    if (category && category.scripts) {
                        consent[key] = category.required || false;
                    }
                    return consent;
                }, {})
            };
            this.saveConsent(minimalConsent);
        }
        
        this.notification.classList.remove('cookie-consent--visible');
    }

    /**
     * Создает объект согласия на основе категорий
     * @param {boolean} [allAccepted=true] - Принять ли все категории
     * @returns {Object} Объект согласия
     * @private
     */
    _createConsentObject(allAccepted = true) {
        return {
            is_cookies_accepted: 1,
            timestamp: Date.now(),
            ...Object.entries(this.config.categories).reduce((consent, [key, category]) => {
                if (category && category.scripts) {
                    consent[key] = allAccepted ? true : (category.required || false);
                }
                return consent;
            }, {})
        };
    }

    handleAcceptAll() {
        this._logger.info('ConsentNotification: handleAcceptAll called');
        this.saveConsent(this._createConsentObject(true));
        this.hide();
    }

    handleAcceptNecessary() {
        this._logger.info('ConsentNotification: handleAcceptNecessary called');
        const consent = this._createConsentObject(false);
        this.saveConsent(consent);
        
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        if (modalSettings.showExperienceImprove) {
            this.showExperienceImprove();
        } else {
            this.hide();
        }
    }

    handleAcceptSelected() {
        this._logger.info('ConsentNotification: handleAcceptSelected called');
        const checkboxes = this.notification.querySelectorAll('.cookie-consent__checkbox input[type="checkbox"]');
        const consent = {
            is_cookies_accepted: 1
        };
        // Собираем выбранные категории только для существующих категорий из конфигурации
        Object.entries(this.config.categories).forEach(([key, category]) => {
            if (category && category.scripts) {
                const checkbox = this.notification.querySelector(`input[name="${key}"]`);
                consent[key] = checkbox ? checkbox.checked : category.required || false;
            }
        });
        this._logger.info('Selected consent:', consent);
        // Проверяем, выбраны ли все доступные категории
        const allCategoriesSelected = Object.entries(this.config.categories)
            .filter(([_, category]) => category && category.scripts && !category.required)
            .every(([key]) => consent[key]);
        this._logger.info('All categories selected:', allCategoriesSelected, {
            categories: Object.entries(this.config.categories)
                .filter(([_, category]) => category && category.scripts && !category.required)
                .map(([key]) => ({ key, selected: consent[key] }))
        });
        // Сохраняем настройки
        this.saveConsent(consent);
        // В простом режиме просто закрываем окно после сохранения настроек
        if (this.isSimpleMode) {
            this.hide();
            return;
        }
        // Для обычного режима проверяем показ EXPERIENCE_IMPROVE
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        // Показываем EXPERIENCE_IMPROVE только если:
        // 1. Это разрешено в настройках модального окна
        // 2. Не все категории выбраны
        // 3. Мы находимся в режиме MANUAL_SETTINGS
        if (modalSettings.showExperienceImprove && 
            !allCategoriesSelected && 
            this.currentModalType === this.config.modalTypes.MANUAL_SETTINGS) {
            this._logger.info('Will show EXPERIENCE_IMPROVE banner');
            // Сначала скрываем текущее модальное окно
            this.hide();
            // Даем время на анимацию закрытия и обновление DOM
            setTimeout(() => {
                this._logger.info('Showing EXPERIENCE_IMPROVE banner after delay');
                this.showExperienceImprove();
            }, 300);
        } else {
            this._logger.info('Hiding modal without showing EXPERIENCE_IMPROVE:', {
                showExperienceImprove: modalSettings.showExperienceImprove,
                allCategoriesSelected,
                currentModalType: this.currentModalType
            });
            // Если требуется перезагрузка, делаем ее здесь
            if (this._pendingReload) {
                this._logger.info('Reloading page after MANUAL_SETTINGS (no EXPERIENCE_IMPROVE)');
                window.location.reload();
            } else {
                this.hide();
            }
        }
    }

    handleSimpleAccept() {
        this._logger.info('ConsentNotification: handleSimpleAccept called');
        
        if (this.isSimpleMode) {
            const consent = this._createConsentObject(true);
            this._secureStorageSet('cookieConsent', consent);
            this.hide();
            return;
        }
        
        this.saveConsent(this._createConsentObject(true));
        this.hide();
    }

    /**
     * Загружает скрипты на основе согласия
     * @param {ConsentData} consent - Данные согласия
     * @private
     */
    loadScripts(consent) {
        try {
            this._logger.info('Loading scripts based on consent:', consent);
            
            // Очистка cookies уже выполнена в _initialize или при сохранении согласия
            if (!this._cookiesCleared) {
                this._clearUnauthorizedCookies();
                this._cookiesCleared = true;
            }
            
            Object.entries(consent).forEach(([category, isAllowed]) => {
                if (isAllowed && this.config.categories[category]?.scripts) {
                    this._loadCategoryScripts(category);
                }
            });
        } catch (error) {
            this._logger.error('Failed to load scripts:', error);
            throw error;
        }
    }

    /**
     * Загружает скрипты для категории
     * @param {string} category - Категория
     * @private
     */
    _loadCategoryScripts(category) {
        try {
            const scripts = this.config.categories[category]?.scripts || [];
            scripts.forEach(script => {
                if (!this._validateScript(script)) {
                    this._logger.warn(`Invalid script configuration for category ${category}:`, script);
                    return;
                }

                switch (script.type) {
                    case 'file':
                        this._loadFileScript(category, script);
                        break;
                    case 'inline':
                        this._loadInlineScript(category, script);
                        break;
                    case 'gtm':
                        this._sendGtmEvent(script.name, script.data);
                        break;
                    case 'event':
                        this._triggerScriptEvent(script);
                        break;
                }
            });
        } catch (error) {
            this._logger.error(`Failed to load scripts for category ${category}:`, error);
            throw error;
        }
    }

    /**
     * Загружает файловый скрипт
     * @param {string} category - Категория
     * @param {Object} script - Конфигурация скрипта
     * @private
     */
    _loadFileScript(category, script) {
        try {
            this._logger.info(`Loading file script from category ${category}: ${script.path}`);
            
            // Формируем полный путь к скрипту
            let fullPath;
            if (script.path.startsWith('http://') || script.path.startsWith('https://')) {
                // Если это полный URL, используем его как есть
                fullPath = script.path;
            } else {
                // Все остальные пути считаем абсолютными
                fullPath = script.path.startsWith('/') ? script.path : '/' + script.path;
            }
            
            this._logger.info('Full script path:', fullPath);
            
            const scriptElement = document.createElement('script');
            scriptElement.src = fullPath;
            scriptElement.onerror = (error) => {
                this._logger.error(`Failed to load script ${fullPath}:`, error);
            };
            document.body.appendChild(scriptElement);
        } catch (error) {
            this._logger.error(`Failed to load file script ${script.path}:`, error);
            throw error;
        }
    }

    /**
     * Загружает встроенный скрипт
     * @param {string} category - Категория
     * @param {Object} script - Конфигурация скрипта
     * @private
     */
    _loadInlineScript(category, script) {
        try {
            this._logger.info(`Loading inline script from category ${category}`);
            
            const scriptElement = document.createElement('script');
            scriptElement.textContent = script.code;
            document.body.appendChild(scriptElement);
        } catch (error) {
            this._logger.error(`Failed to load inline script for category ${category}:`, error);
            throw error;
        }
    }

    _triggerScriptEvent(script) {
        const { name, data = {} } = script;
        
        // Отправляем событие в GTM если включен
        if (this.config.tagManagers?.gtm && typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: name,
                ...data,
                timestamp: new Date().toISOString()
            });
        }

        // Отправляем событие в Matomo если включен
        if (this.config.tagManagers?.matomo && typeof _paq !== 'undefined') {
            _paq.push(['trackEvent', 'CookieConsent', name, JSON.stringify(data)]);
        }

        // Отправляем кастомное событие
        window.dispatchEvent(new CustomEvent(`cookieConsent:${name}`, {
            detail: data
        }));
    }

    /**
     * Сохраняет согласие пользователя
     * @param {ConsentData} consent - Данные согласия
     */
    saveConsent(consent) {
        this._logger.info('Saving new consent:', consent);
        
        // Добавляем timestamp к новому согласию
        const newConsent = {
            ...consent,
            timestamp: Date.now()
        };

        // Форматируем данные для хранения
        const storageData = {
            is_cookies_accepted: newConsent.is_cookies_accepted,
            timestamp: newConsent.timestamp,
            value: Object.entries(this.config.categories).reduce((acc, [key, category]) => {
                if (category && category.scripts) {
                    acc[key] = newConsent[key] || false;
                }
                return acc;
            }, {})
        };

        // Сохраняем в хранилище
        try {
            localStorage.setItem('cookieConsent', JSON.stringify(storageData));
            this._logger.info('Consent saved successfully');
        } catch (error) {
            this._logger.error('Failed to save consent:', error);
            if (this._getStorage() !== sessionStorage) {
                this._logger.warn('Falling back to sessionStorage');
                this._storageType = 'session';
                this._secureStorageSet('cookieConsent', storageData);
            }
        }

        // Отправляем событие в GTM
        this._sendGtmEvent(this.config.tagManagers.gtm.events.consent, {
            consent: newConsent,
            categories: Object.entries(newConsent)
                .filter(([key]) => key !== 'is_cookies_accepted' && key !== 'timestamp')
                .reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {})
        });

        // Отправляем событие в браузер
        window.dispatchEvent(new CustomEvent('cookieConsent', {
            detail: newConsent
        }));
        
        // Очищаем неавторизованные cookies при изменении согласия
        this._clearUnauthorizedCookies();
        this._cookiesCleared = true;
        
        // Если скрипты были отключены, откладываем перезагрузку до EXPERIENCE_IMPROVE
        this._pendingReload = Object.entries(consent).some(([category, isAllowed]) => {
            return category !== 'is_cookies_accepted' && 
                   category !== 'timestamp' && 
                   !isAllowed;
        });
        
        // Сохраняем согласие для последующей загрузки скриптов
        this.pendingConsent = newConsent;
    }

    /**
     * Генерирует CSRF токен
     * @returns {string} CSRF токен
     * @private
     */
    _generateCsrfToken() {
        const array = new Uint32Array(8);
        crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    }

    /**
     * Проверяет валидность скрипта
     * @param {Object} script - Конфигурация скрипта
     * @returns {boolean} Валидность скрипта
     * @private
     */
    _validateScript(script) {
        if (!script || typeof script !== 'object') return false;

        // Проверяем тип скрипта
        if (!['file', 'inline', 'event', 'gtm'].includes(script.type)) return false;

        // Проверяем путь для файловых скриптов
        if (script.type === 'file') {
            if (!script.path || typeof script.path !== 'string') return false;
            // Проверяем, что путь содержит только безопасные символы
            if (!/^[a-zA-Z0-9\-_\/\.]+$/.test(script.path)) return false;
        }

        // Проверяем код для встроенных скриптов
        if (script.type === 'inline' && (!script.code || typeof script.code !== 'string')) {
            return false;
        }

        // Проверяем данные для событий и GTM
        if (script.type === 'event' || script.type === 'gtm') {
            if (!script.name || typeof script.name !== 'string') return false;
            if (script.data && typeof script.data !== 'object') return false;
        }

        return true;
    }

    /**
     * Безопасно сохраняет данные в localStorage
     * @param {string} key - Ключ
     * @param {*} value - Значение
     * @private
     */
    _secureStorageSet(key, consentData) {
        try {
            this._logger.info('Saving to storage:', { key, consentData });
            
            // Создаем объект value только из категорий, определенных в конфигурации
            const categoryValues = Object.entries(this.config.categories).reduce((acc, [key, category]) => {
                if (category && category.scripts) {
                    acc[key] = consentData[key] || false;
                }
                return acc;
            }, {});

            const storageData = {
                is_cookies_accepted: consentData.is_cookies_accepted || 0,
                timestamp: Date.now(),
                value: categoryValues
            };

            this._logger.info('Formatted storage data:', storageData);
            const storage = this._getStorage();
            storage.setItem(key, JSON.stringify(storageData));
            
            // Проверяем, что данные действительно сохранились
            const savedData = JSON.parse(storage.getItem(key));
            this._logger.info('Verified saved data:', savedData);
        } catch (error) {
            this._logger.error('Error saving to storage:', error);
            if (this._getStorage() !== sessionStorage) {
                this._logger.warn('Falling back to sessionStorage');
                this._storageType = 'session';
                this._secureStorageSet(key, consentData);
            }
        }
    }

    /**
     * Безопасно получает данные из localStorage
     * @param {string} key - Ключ
     * @returns {*} Значение или null
     * @private
     */
    _secureStorageGet(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;

            const parsed = JSON.parse(data);
            
            // Проверяем срок действия (24 часа)
            if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                this._logger.warn('Consent data expired');
                localStorage.removeItem(key);
                return null;
            }

            // Если конфигурация еще не инициализирована, возвращаем данные как есть
            if (!this.config || !this.config.categories) {
                return parsed;
            }

            // Проверяем и фильтруем категории на основе конфигурации
            const validCategories = Object.entries(this.config.categories).reduce((acc, [key, category]) => {
                if (category && category.scripts) {
                    acc[key] = parsed.value?.[key] || false;
                }
                return acc;
            }, {});

            return {
                is_cookies_accepted: parsed.is_cookies_accepted,
                timestamp: parsed.timestamp,
                ...validCategories
            };
        } catch (error) {
            this._logger.error('Failed to read from storage:', error);
            try {
                const sessionData = sessionStorage.getItem(key);
                if (sessionData) {
                    return JSON.parse(sessionData);
                }
            } catch (e) {
                this._logger.error('Failed to read from sessionStorage:', e);
            }
            return null;
        }
    }

    /**
     * Добавляет заголовки безопасности
     * @private
     */
    _addSecurityHeaders() {
        // Устанавливаем только CSP через meta тег
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
            "https://www.googletagmanager.com " +
            "https://www.google-analytics.com " +
            "https://ssl.google-analytics.com " +
            "https://cdn.matomo.cloud; " +
            "connect-src 'self' " +
            "https://www.google-analytics.com " +
            "https://region1.google-analytics.com " +
            "https://analytics.google.com " +
            "https://stats.g.doubleclick.net; " +
            "img-src 'self' data: https:; " +
            "style-src 'self' 'unsafe-inline';";
        document.head.appendChild(meta);

        // Остальные заголовки должны устанавливаться на сервере
        this._logger.info('Security headers should be set on the server side');
    }

    /**
     * Отправляет событие в GTM
     * @param {string} eventName - Имя события
     * @param {Object} [data] - Дополнительные данные
     * @private
     */
    _sendGtmEvent(eventName, data = {}) {
        if (this.config.tagManagers?.gtm?.enabled && typeof window[this.config.tagManagers.gtm.dataLayer] !== 'undefined') {
            // Добавляем action для события settings
            if (eventName === this.config.tagManagers.gtm.events.settings) {
                data = { ...data, action: data.action || 'interact' };
            }
            
            window[this.config.tagManagers.gtm.dataLayer].push({
                event: eventName,
                ...data,
                timestamp: new Date().toISOString()
            });
            this._logger.info(`GTM event sent: ${eventName}`, data);
        }
    }

    _getStorage() {
        return localStorage;
    }

    /**
     * Очищает неавторизованные cookies
     * @private
     */
    _clearUnauthorizedCookies() {
        try {
            // Если конфигурация еще не инициализирована, пропускаем очистку
            if (!this.config || !this.config.categories) {
                this._logger.info('Config not yet initialized, skipping cookie cleanup');
                return;
            }
            const savedConsent = this._secureStorageGet('cookieConsent');
            const cookies = document.cookie.split(';');
            this._logger.info('_clearUnauthorizedCookies: savedConsent', savedConsent);
            this._logger.info('_clearUnauthorizedCookies: cookies', cookies);
            // Список cookies, которые требуют согласия
            const consentRequiredCookies = {
                analytics: ['_ym_uid', '_ym_d', '_ga', '_gid', '_gat'],
                marketing: ['_fbp', '_fbc'],
                functional: ['PHPSESSID'] // Если используется для функциональности, требующей согласия
            };
            // Очищаем cookies, для которых нет согласия
            cookies.forEach(cookie => {
                const [name] = cookie.trim().split('=');
                let shouldDelete = false;
                // Проверяем каждую категорию
                Object.entries(consentRequiredCookies).forEach(([category, cookieList]) => {
                    if (cookieList.includes(name) && (!savedConsent || !savedConsent[category])) {
                        shouldDelete = true;
                    }
                });
                if (shouldDelete) {
                    this._logger.info('_clearUnauthorizedCookies: deleting', name);
                    this._deleteCookie(name);
                } else {
                    this._logger.info('_clearUnauthorizedCookies: keeping', name);
                }
            });
        } catch (error) {
            this._logger.error('Error clearing unauthorized cookies:', error);
        }
    }

    /**
     * Удаляет cookie
     * @param {string} name - Имя cookie
     * @private
     */
    _deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        // Также удаляем для поддоменов
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    }
}

/**
 * Класс для логирования
 * @class Logger
 */
class Logger {
    /**
     * Создает экземпляр Logger
     * @param {string} context - Контекст логирования
     */
    constructor(context) {
        this.context = context;
        // Проверяем глобальную переменную отладки
        this.isDebugEnabled = typeof window !== 'undefined' && window.__COOKIE_CONSENT_DEBUG__ === true;
    }

    /**
     * Логирует информационное сообщение
     * @param {string} message - Сообщение
     * @param {*} [data] - Дополнительные данные
     */
    info(message, data) {
        if (!this.isDebugEnabled) return; // Прекращаем выполнение если отладка отключена
        console.log(`[${this.context}] ${message}`, data || '');
    }

    /**
     * Логирует предупреждение
     * @param {string|Error} message - Сообщение или ошибка
     * @param {*} [data] - Дополнительные данные
     */
    warn(message, data) {
        if (!this.isDebugEnabled) return; // Прекращаем выполнение если отладка отключена
        console.warn(`[${this.context}] ${message}`, data || '');
    }

    /**
     * Логирует ошибку
     * @param {string|Error} message - Сообщение или ошибка
     * @param {*} [data] - Дополнительные данные
     */
    error(message, data) {
        // Ошибки всегда логируем, независимо от режима отладки
        if (this.isDebugEnabled) {
            console.error(`[${this.context}] ${message}`, data || '');
        }
        // В продакшене можно добавить отправку ошибок в систему мониторинга
        if (typeof window !== 'undefined' && window.__COOKIE_CONSENT_ERROR_HANDLER__) {
            window.__COOKIE_CONSENT_ERROR_HANDLER__(message, data);
        }
    }
} 