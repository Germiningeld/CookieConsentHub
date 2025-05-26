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

        // Обработчик для оверлея
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
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
                    <button class="cookie-consent__button cookie-consent__button--all">${this.config.texts.settings.acceptAll}</button>
                    <button class="cookie-consent__button cookie-consent__button--selected">${this.config.texts.settings.acceptSelected}</button>
                `;
                
                // Пересоздаем обработчики событий
                this.addEventListeners();
            }
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
        
        // Сохраняем настройки и применяем их
        this.saveConsent(consent);
        
        // Просто скрываем баннер без показа вторичного
        this.hide();
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
<<<<<<< HEAD
=======
        
        // Если скрипты были отключены, перезагружаем страницу
        if (scriptsDisabled) {
            window.location.reload();
            return;
        }
        
        // Сохраняем согласие для последующей загрузки скриптов
        this.pendingConsent = consent;
>>>>>>> parent of fb533a6 (Revert "Add overlay behavior")
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

    // Новый метод для открытия настроек в любое время
    openSettings() {
        console.log('ConsentNotification: openSettings called');
        if (!this.notification) {
            this.createElements();
        }
        
        // Загружаем сохраненные настройки
        const savedConsent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
        
        this.notification.innerHTML = `
            <div class="cookie-consent__content">
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
        this.addEventListeners();
        this.show();
    }
} 