export class ConsentNotification {
    constructor() {
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
        this.categories = {
            necessary: {
                title: 'Необходимые',
                description: 'Эти файлы cookie необходимы для работы сайта и не могут быть отключены.',
                required: true
            },
            analytics: {
                title: 'Аналитика',
                description: 'Эти файлы cookie помогают нам улучшать наш сайт, собирая информацию о его использовании.',
                required: false
            },
            marketing: {
                title: 'Маркетинг',
                description: 'Эти файлы cookie используются для отслеживания посетителей на веб-сайтах.',
                required: false
            },
            functional: {
                title: 'Функциональные',
                description: 'Эти файлы cookie позволяют сайту запоминать сделанные вами выборы.',
                required: false
            }
        };
        this.initialize();
    }

    initialize() {
        console.log('ConsentNotification: initialize called');
        this.createElements();
        this.render();
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
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'cookie-consent-overlay';
        
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
        const settingsLink = this.notification.querySelector('.cookie-consent__link--settings');
        const closeBtn = this.notification.querySelector('.cookie-consent__button--close');

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => this.handleAcceptAll());
        }
        if (acceptNecessaryBtn) {
            acceptNecessaryBtn.addEventListener('click', () => this.handleAcceptNecessary());
        }
        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSettings();
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Обработчик для оверлея
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.handleAcceptNecessary();
            }
        });

        // Обработчики для чекбоксов в настройках
        const checkboxes = this.notification.querySelectorAll('.cookie-consent__checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleCheckboxChange());
        });
        console.log('ConsentNotification: Event listeners added');
    }

    handleCheckboxChange() {
        console.log('ConsentNotification: handleCheckboxChange called');
        const checkboxes = this.notification.querySelectorAll('.cookie-consent__checkbox input[type="checkbox"]');
        const consent = {};
        
        checkboxes.forEach(checkbox => {
            consent[checkbox.name] = checkbox.checked;
        });

        this.saveConsent(consent);
    }

    render() {
        console.log('ConsentNotification: render called');
        // Проверяем, не было ли уже сохранено согласие
        const savedConsent = localStorage.getItem('cookieConsent');
        if (savedConsent) {
            console.log('ConsentNotification: Consent already saved, not showing banner');
            return;
        }

        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                <h2 class="cookie-consent__title">Настройки файлов cookie</h2>
                <p class="cookie-consent__description">Мы используем файлы cookie для улучшения вашего опыта на нашем сайте. Пожалуйста, выберите, какие файлы cookie вы хотите принять.</p>
                <div class="cookie-consent__categories">
                    ${Object.entries(this.categories).map(([key, category]) => `
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
                    <button class="cookie-consent__button cookie-consent__button--all">Принять все</button>
                    <button class="cookie-consent__button cookie-consent__button--necessary">Только необходимые</button>
                    <a href="#" class="cookie-consent__link cookie-consent__link--settings">Настроить предпочтения</a>
                </div>
            </div>
        `;
        this.addEventListeners();
        this.show();
        console.log('ConsentNotification: Banner rendered and shown');
    }

    show() {
        console.log('ConsentNotification: show called');
        this.notification.classList.add('cookie-consent--visible');
        this.overlay.style.display = 'block';
        this.isVisible = true;
        this.isOverlayVisible = true;
        document.body.style.overflow = 'hidden';
    }

    hide() {
        console.log('ConsentNotification: hide called');
        this.notification.classList.remove('cookie-consent--visible');
        this.overlay.style.display = 'none';
        this.isVisible = false;
        this.isOverlayVisible = false;
        document.body.style.overflow = '';
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
        this.showSecondaryBanner();
    }

    handleSettings() {
        console.log('ConsentNotification: handleSettings called');
        const categories = this.notification.querySelector('.cookie-consent__categories');
        if (categories) {
            categories.classList.toggle('cookie-consent__categories--visible');
            this.isSettingsVisible = !this.isSettingsVisible;
            
            // Обновляем кнопки при открытии настроек
            if (this.isSettingsVisible) {
                const buttonsContainer = this.notification.querySelector('.cookie-consent__buttons');
                buttonsContainer.innerHTML = `
                    <button class="cookie-consent__button cookie-consent__button--all">Принять все</button>
                    <button class="cookie-consent__button cookie-consent__button--selected">Принять выбранные</button>
                `;
                
                // Добавляем обработчики для новых кнопок
                const acceptAllBtn = buttonsContainer.querySelector('.cookie-consent__button--all');
                const acceptSelectedBtn = buttonsContainer.querySelector('.cookie-consent__button--selected');
                
                if (acceptAllBtn) {
                    acceptAllBtn.addEventListener('click', () => this.handleAcceptAll());
                }
                if (acceptSelectedBtn) {
                    acceptSelectedBtn.addEventListener('click', () => this.handleAcceptSelected());
                }
            }
        }
    }

    handleAcceptSelected() {
        console.log('ConsentNotification: handleAcceptSelected called');
        const checkboxes = this.notification.querySelectorAll('.cookie-consent__checkbox input[type="checkbox"]');
        const consent = {};
        let allSelected = true;
        
        checkboxes.forEach(checkbox => {
            consent[checkbox.name] = checkbox.checked;
            if (!checkbox.checked) {
                allSelected = false;
            }
        });

        this.saveConsent(consent);
        
        // Показываем второй баннер, если не все опции выбраны
        if (!allSelected) {
            this.showSecondaryBanner();
        } else {
            this.hide();
        }
    }

    saveConsent(consent) {
        console.log('ConsentNotification: saveConsent called with', consent);
        localStorage.setItem('cookieConsent', JSON.stringify(consent));
        window.dispatchEvent(new CustomEvent('cookieConsent', {
            detail: consent
        }));
    }

    showSecondaryBanner() {
        console.log('ConsentNotification: showSecondaryBanner called');
        this.notification.innerHTML = `
            <div class="cookie-consent__content">
                <h2 class="cookie-consent__title">Улучшите свой опыт</h2>
                <p class="cookie-consent__description">Разрешите аналитические и маркетинговые cookie для получения персонализированного контента и улучшения нашего сервиса.</p>
                <div class="cookie-consent__buttons">
                    <button class="cookie-consent__button cookie-consent__button--all">Разрешить все</button>
                    <button class="cookie-consent__button cookie-consent__button--close">Оставить мой выбор</button>
                </div>
            </div>
        `;
        this.notification.classList.add('cookie-consent--secondary');
        this.addEventListeners();
        console.log('ConsentNotification: Secondary banner shown');
    }
} 