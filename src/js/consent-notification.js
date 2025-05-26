import { cookieConsentConfig } from './cookie-consent-config.js';

export class ConsentNotification {
    constructor(config = {}) {
        console.log('ConsentNotification: constructor called');
        // Проверяем, не существует ли уже экземпляр
        if (window.cookieConsentInstance) {
            console.warn('ConsentNotification: Instance already exists');
            return window.cookieConsentInstance;
        }
        window.cookieConsentInstance = this;

        this.notification = null;
        this.overlay = null;
        this.isVisible = false;
        this.isOverlayVisible = false;
        this.isSettingsVisible = false;
        this.pendingConsent = null;
        this.currentModalType = null;

        // Объединяем конфигурацию по умолчанию с пользовательской
        this.config = {
            modalTypes: cookieConsentConfig.modalTypes,
            visual: { ...cookieConsentConfig.visual, ...config.visual },
            categories: { ...cookieConsentConfig.categories, ...config.categories },
            texts: { ...cookieConsentConfig.texts, ...config.texts }
        };

        this.initialize();
    }

    initialize() {
        console.log('ConsentNotification: initialize called');
        const savedConsent = localStorage.getItem('cookieConsent');
        
        if (savedConsent) {
            console.log('ConsentNotification: Found saved consent, loading scripts');
            this.loadScripts(JSON.parse(savedConsent));
        } else {
            console.log('ConsentNotification: No saved consent, showing banner');
            this.createElements();
            this.render();
        }
    }

    createElements() {
        console.log('ConsentNotification: createElements called');
        // Проверяем, не существуют ли уже элементы
        if (document.querySelector('.cookie-consent')) {
            console.warn('ConsentNotification: Elements already exist, removing old ones');
            document.querySelector('.cookie-consent')?.remove();
            document.querySelector('.cookie-consent-overlay')?.remove();
        }

        this.notification = document.createElement('div');
        this.notification.className = 'cookie-consent';
        // Применяем настройки модального окна
        this.notification.style.setProperty('--cookie-consent-z-index', this.config.visual.modal.zIndex);
        this.notification.style.setProperty('--cookie-consent-max-width', this.config.visual.modal.maxWidth);
        this.notification.style.setProperty('--cookie-consent-border-radius', this.config.visual.modal.borderRadius);
        this.notification.style.setProperty('--cookie-consent-box-shadow', this.config.visual.modal.boxShadow);
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'cookie-consent-overlay';
        // Применяем настройки оверлея
        this.overlay.style.setProperty('--cookie-consent-blur', this.config.visual.overlay.blur);
        this.overlay.style.setProperty('--cookie-consent-overlay-color', this.config.visual.overlay.color);
        this.overlay.style.setProperty('--cookie-consent-overlay-z-index', this.config.visual.overlay.zIndex);
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.notification);
        console.log('ConsentNotification: Elements created and added to DOM');
    }

    addEventListeners() {
        console.log('ConsentNotification: addEventListeners called');
        // Удаляем старые обработчики
        const oldButtons = this.notification.querySelectorAll('button');
        oldButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });

        // Добавляем новые обработчики
        const acceptAllBtn = this.notification.querySelector('.cookie-consent__button--all');
        const acceptNecessaryBtn = this.notification.querySelector('.cookie-consent__button--necessary');
        const acceptSelectedBtn = this.notification.querySelector('.cookie-consent__button--selected');
        const settingsLink = this.notification.querySelector('.cookie-consent__link--settings');
        const closeBtn = this.notification.querySelector('.cookie-consent__button--close');

        console.log('Found buttons:', {
            acceptAll: !!acceptAllBtn,
            acceptNecessary: !!acceptNecessaryBtn,
            acceptSelected: !!acceptSelectedBtn,
            settings: !!settingsLink,
            close: !!closeBtn
        });

        if (acceptAllBtn) {
            console.log('Adding accept all handler');
            acceptAllBtn.addEventListener('click', () => {
                console.log('Accept all clicked');
                this.handleAcceptAll();
            });
        }
        if (acceptNecessaryBtn) {
            console.log('Adding accept necessary handler');
            acceptNecessaryBtn.addEventListener('click', () => {
                console.log('Accept necessary clicked');
                this.handleAcceptNecessary();
            });
        }
        if (acceptSelectedBtn) {
            console.log('Adding accept selected handler');
            acceptSelectedBtn.addEventListener('click', () => {
                console.log('Accept selected clicked');
                this.handleAcceptSelected();
            });
        }
        if (settingsLink) {
            console.log('Adding settings handler');
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Settings clicked');
                this.handleSettings();
            });
        }
        if (closeBtn) {
            console.log('Adding close handler');
            closeBtn.addEventListener('click', () => {
                console.log('Close clicked');
                this.hide();
            });
        }

        // Обработчик для кнопки закрытия
        const closeButton = this.notification.querySelector('.cookie-consent__close-button');
        if (closeButton) {
            console.log('Adding close button handler');
            closeButton.addEventListener('click', () => {
                console.log('Close button clicked');
                this.hide();
            });
        }

        // Обработчик для оверлея
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay && this.config.visual.allowClose) {
                console.log('Overlay clicked');
                // Проверяем, есть ли сохраненные настройки
                const savedConsent = localStorage.getItem('cookieConsent');
                
                if (savedConsent) {
                    // Если настройки уже есть - просто закрываем модальное окно
                    console.log('Settings exist, just closing modal');
                    this.hide();
                } else {
                    // Если настройки еще не установлены - показываем сообщение
                    console.log('No settings yet, showing message');
                    alert('Пожалуйста, выберите настройки cookie для продолжения работы с сайтом');
                }
            }
        });

        // Обработчики для чекбоксов в настройках
        const checkboxes = this.notification.querySelectorAll('.cookie-consent__checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                console.log('Checkbox changed:', checkbox.name, checkbox.checked);
                this.handleCheckboxChange();
            });
        });
        console.log('ConsentNotification: Event listeners added');
    }

    handleCheckboxChange() {
        console.log('ConsentNotification: handleCheckboxChange called');
        // Убираем немедленное сохранение настроек
        // Теперь настройки будут сохраняться только после нажатия кнопки
    }

    render() {
        console.log('ConsentNotification: render called');
        // Проверяем, не было ли уже сохранено согласие
        const savedConsent = localStorage.getItem('cookieConsent');
        if (savedConsent) {
            console.log('ConsentNotification: Consent already saved, not showing banner');
            return;
        }

        this.currentModalType = this.config.modalTypes.INITIAL;
        this.renderModal(this.currentModalType);
    }

    renderModal(modalType) {
        console.log(`ConsentNotification: Rendering modal type: ${modalType}`);
        
        // Получаем настройки для текущего типа модального окна
        const modalSettings = this.config.visual.modalTypes[modalType];
        
        // Сбрасываем все классы позиционирования и анимации
        this.notification.classList.remove(
            'cookie-consent--secondary',
            'cookie-consent--top',
            'cookie-consent--bottom',
            'cookie-consent--fade',
            'cookie-consent--slide'
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

        // Показываем/скрываем оверлей
        this.overlay.style.display = modalSettings.showOverlay ? 'block' : 'none';
        
        // Обновляем обработчик клика по оверлею
        this.overlay.onclick = modalSettings.closeOnOverlayClick ? 
            (e) => {
                if (e.target === this.overlay && modalSettings.allowClose) {
                    this.hide();
                }
            } : null;

        // Рендерим содержимое модального окна
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
        this.addEventListeners();
        this.show();
    }

    renderInitialModal() {
        const modalSettings = this.config.visual.modalTypes[this.config.modalTypes.INITIAL];
        const isInline = modalSettings.position === 'top' || modalSettings.position === 'bottom';
        
        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                ${this.config.visual.modal.allowClose ? '<button class="cookie-consent__close-button" aria-label="Закрыть"></button>' : ''}
                ${isInline ? `
                    <div>
                        <h2 class="cookie-consent__title">${this.config.texts.mainBanner.title}</h2>
                        <p class="cookie-consent__description">${this.config.texts.mainBanner.description}</p>
                    </div>
                ` : `
                    <h2 class="cookie-consent__title">${this.config.texts.mainBanner.title}</h2>
                    <p class="cookie-consent__description">${this.config.texts.mainBanner.description}</p>
                `}
                <div class="cookie-consent__buttons">
                    <button class="cookie-consent__button cookie-consent__button--all">${this.config.texts.mainBanner.acceptAll}</button>
                    <button class="cookie-consent__button cookie-consent__button--necessary">${this.config.texts.mainBanner.acceptNecessary}</button>
                    <a href="#" class="cookie-consent__link cookie-consent__link--settings">${this.config.texts.mainBanner.settings}</a>
                </div>
            </div>
        `;
    }

    renderFirstVisitSettingsModal() {
        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                ${this.config.visual.allowClose ? '<button class="cookie-consent__close-button" aria-label="Закрыть"></button>' : ''}
                <h2 class="cookie-consent__title">${this.config.texts.mainBanner.title}</h2>
                <p class="cookie-consent__description">${this.config.texts.mainBanner.description}</p>
                <div class="cookie-consent__categories cookie-consent__categories--visible">
                    ${Object.entries(this.config.categories).map(([key, category]) => `
                        <div class="cookie-consent__category">
                            <label class="cookie-consent__checkbox">
                                <input type="checkbox" name="${key}" ${category.required ? 'checked disabled' : ''}>
                                <div>
                                    <div class="cookie-consent__category-title">${category.title}</div>
                                    <div class="cookie-consent__category-description">${category.description}</div>
                                </div>
                            </label>
                        </div>
                    `).join('')}
                </div>
                <div class="cookie-consent__buttons">
                    <button class="cookie-consent__button cookie-consent__button--all">${this.config.texts.settings.acceptAll}</button>
                    <button class="cookie-consent__button cookie-consent__button--selected">${this.config.texts.settings.acceptSelected}</button>
                </div>
            </div>
        `;
        this.isSettingsVisible = true;
    }

    renderExperienceImproveModal() {
        const modalSettings = this.config.visual.modalTypes[this.config.modalTypes.EXPERIENCE_IMPROVE];
        const isInline = modalSettings.position === 'top' || modalSettings.position === 'bottom';
        
        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                ${this.config.visual.modal.allowClose ? '<button class="cookie-consent__close-button" aria-label="Закрыть"></button>' : ''}
                ${isInline ? `
                    <div>
                        <h2 class="cookie-consent__title">${this.config.texts.secondaryBanner.title}</h2>
                        <p class="cookie-consent__description">${this.config.texts.secondaryBanner.description}</p>
                    </div>
                ` : `
                    <h2 class="cookie-consent__title">${this.config.texts.secondaryBanner.title}</h2>
                    <p class="cookie-consent__description">${this.config.texts.secondaryBanner.description}</p>
                `}
                <div class="cookie-consent__buttons">
                    <button class="cookie-consent__button cookie-consent__button--all">${this.config.texts.secondaryBanner.acceptAll}</button>
                    <button class="cookie-consent__button cookie-consent__button--close">${this.config.texts.secondaryBanner.keepChoice}</button>
                </div>
            </div>
        `;
    }

    renderManualSettingsModal() {
        const savedConsent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
        
        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                ${this.config.visual.allowClose ? '<button class="cookie-consent__close-button" aria-label="Закрыть"></button>' : ''}
                <h2 class="cookie-consent__title">${this.config.texts.mainBanner.title}</h2>
                <p class="cookie-consent__description">${this.config.texts.mainBanner.description}</p>
                <div class="cookie-consent__categories cookie-consent__categories--visible">
                    ${Object.entries(this.config.categories).map(([key, category]) => `
                        <div class="cookie-consent__category">
                            <label class="cookie-consent__checkbox">
                                <input type="checkbox" name="${key}" 
                                    ${category.required ? 'checked disabled' : ''} 
                                    ${savedConsent[key] ? 'checked' : ''}>
                                <div>
                                    <div class="cookie-consent__category-title">${category.title}</div>
                                    <div class="cookie-consent__category-description">${category.description}</div>
                                </div>
                            </label>
                        </div>
                    `).join('')}
                </div>
                <div class="cookie-consent__buttons">
                    <button class="cookie-consent__button cookie-consent__button--all">${this.config.texts.settings.acceptAll}</button>
                    <button class="cookie-consent__button cookie-consent__button--selected">${this.config.texts.settings.acceptSelected}</button>
                </div>
            </div>
        `;
        
        this.isSettingsVisible = true;
    }

    handleSettings() {
        console.log('ConsentNotification: handleSettings called');
        this.renderModal(this.config.modalTypes.FIRST_VISIT_SETTINGS);
    }

    showSecondaryBanner() {
        console.log('ConsentNotification: showSecondaryBanner called');
        this.renderModal(this.config.modalTypes.EXPERIENCE_IMPROVE);
    }

    openSettings() {
        console.log('ConsentNotification: openSettings called');
        if (!this.notification) {
            this.createElements();
        }
        this.renderModal(this.config.modalTypes.MANUAL_SETTINGS);
    }

    show() {
        console.log('ConsentNotification: show called');
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        
        this.notification.classList.add('cookie-consent--visible');
        if (modalSettings.showOverlay) {
            this.overlay.style.display = 'block';
        }
        this.isVisible = true;
        this.isOverlayVisible = modalSettings.showOverlay;

        // Блокируем скроллинг если это требуется для текущего типа модального окна
        if (modalSettings.preventScroll) {
            // Сохраняем текущую позицию скролла
            this._scrollPosition = window.pageYOffset;
            // Добавляем класс для блокировки скролла
            document.body.classList.add('cookie-consent-no-scroll');
            // Фиксируем позицию
            document.body.style.top = `-${this._scrollPosition}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    }

    hide() {
        console.log('ConsentNotification: hide called');
        const modalSettings = this.config.visual.modalTypes[this.currentModalType];
        
        this.notification.classList.remove('cookie-consent--visible');
        this.overlay.style.display = 'none';
        this.isVisible = false;
        this.isOverlayVisible = false;

        // Восстанавливаем скроллинг если он был заблокирован
        if (modalSettings.preventScroll) {
            // Удаляем класс блокировки
            document.body.classList.remove('cookie-consent-no-scroll');
            // Восстанавливаем позицию
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, this._scrollPosition);
            this._scrollPosition = null;
        }

        // Загружаем скрипты при скрытии оверлея
        if (this.pendingConsent) {
            this.loadScripts(this.pendingConsent);
            this.pendingConsent = null;
        }
    }

    handleAcceptAll() {
        console.log('ConsentNotification: handleAcceptAll called');
        const consent = {
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true
        };
        this.saveConsent(consent);
        this.hide();
    }

    handleAcceptNecessary() {
        console.log('ConsentNotification: handleAcceptNecessary called');
        const consent = {
            necessary: true,
            analytics: false,
            marketing: false,
            functional: false
        };
        this.saveConsent(consent);
        
        // Показываем EXPERIENCE_IMPROVE только если это INITIAL или FIRST_VISIT_SETTINGS
        if (this.currentModalType === this.config.modalTypes.INITIAL || 
            this.currentModalType === this.config.modalTypes.FIRST_VISIT_SETTINGS) {
            this.showSecondaryBanner();
        } else {
            this.hide();
        }
    }

    handleAcceptSelected() {
        console.log('ConsentNotification: handleAcceptSelected called');
        const checkboxes = this.notification.querySelectorAll('.cookie-consent__checkbox input[type="checkbox"]');
        const consent = {};
        
        checkboxes.forEach(checkbox => {
            consent[checkbox.name] = checkbox.checked;
        });

        console.log('Selected consent:', consent);
        
        // Проверяем, выбраны ли все доступные категории
        const allCategoriesSelected = Object.entries(this.config.categories)
            .filter(([_, category]) => !category.required) // Исключаем обязательные категории
            .every(([key]) => consent[key]);

        // Сохраняем настройки
        this.saveConsent(consent);
        
        // Показываем EXPERIENCE_IMPROVE только если:
        // 1. Это INITIAL или FIRST_VISIT_SETTINGS
        // 2. Не все категории выбраны
        if ((this.currentModalType === this.config.modalTypes.INITIAL || 
             this.currentModalType === this.config.modalTypes.FIRST_VISIT_SETTINGS) && 
            !allCategoriesSelected) {
            this.showSecondaryBanner();
        } else {
            this.hide();
        }
    }

    loadScripts(consent) {
        console.log('ConsentNotification: Loading scripts based on consent', consent);
        
        Object.entries(consent).forEach(([category, isAllowed]) => {
            if (isAllowed && this.config.categories[category]?.scripts) {
                this.config.categories[category].scripts.forEach(script => {
                    if (script.type === 'file') {
                        console.log(`ConsentNotification: Loading file script from category ${category}: ${script.path}`);
                        alert(`Загружен файл из категории "${this.config.categories[category].title}": ${script.path}`);
                        
                        const scriptElement = document.createElement('script');
                        scriptElement.src = script.path;
                        document.body.appendChild(scriptElement);
                    } else if (script.type === 'inline') {
                        console.log(`ConsentNotification: Loading inline script from category ${category}`);
                        alert(`Выполнен inline-скрипт из категории "${this.config.categories[category].title}"`);
                        
                        const scriptElement = document.createElement('script');
                        scriptElement.textContent = script.code;
                        document.body.appendChild(scriptElement);
                    }
                });
            }
        });
    }

    saveConsent(consent) {
        console.log('ConsentNotification: saveConsent called with', consent);
        const oldConsent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
        
        // Проверяем, были ли отключены какие-либо скрипты
        const scriptsDisabled = Object.entries(consent).some(([category, isAllowed]) => {
            return oldConsent[category] && !isAllowed;
        });

        localStorage.setItem('cookieConsent', JSON.stringify(consent));
        window.dispatchEvent(new CustomEvent('cookieConsent', {
            detail: consent
        }));
        
        // Если скрипты были отключены, перезагружаем страницу
        if (scriptsDisabled) {
            window.location.reload();
            return;
        }
        
        // Сохраняем согласие для последующей загрузки скриптов
        this.pendingConsent = consent;
    }
} 