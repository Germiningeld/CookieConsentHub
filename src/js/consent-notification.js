export class ConsentNotification {
    constructor() {
        this.notification = null;
        this.overlay = null;
        this.isVisible = false;
        this.isOverlayVisible = false;
        this.initialize();
    }

    initialize() {
        // Создаем элементы уведомления
        this.createElements();
        // Добавляем обработчики событий
        this.addEventListeners();
    }

    createElements() {
        // Создаем основной контейнер
        this.notification = document.createElement('div');
        this.notification.className = 'cookie-consent';
        
        // Создаем оверлей
        this.overlay = document.createElement('div');
        this.overlay.className = 'cookie-consent-overlay';
        
        // Добавляем элементы на страницу
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.notification);
    }

    addEventListeners() {
        // Добавляем обработчики для кнопок
        const acceptAllBtn = this.notification.querySelector('.cookie-consent__button--all');
        const acceptNecessaryBtn = this.notification.querySelector('.cookie-consent__button--necessary');
        const settingsBtn = this.notification.querySelector('.cookie-consent__button--settings');

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => this.handleAcceptAll());
        }
        if (acceptNecessaryBtn) {
            acceptNecessaryBtn.addEventListener('click', () => this.handleAcceptNecessary());
        }
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.handleSettings());
        }

        // Добавляем обработчик для оверлея
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.handleAcceptNecessary(); // При клике на оверлей принимаем только необходимые
            }
        });
    }

    render() {
        if (!this.isVisible) {
            this.notification.innerHTML = `
                <div class="cookie-consent__content">
                    <h2 class="cookie-consent__title">Настройки файлов cookie</h2>
                    <p class="cookie-consent__description">Мы используем файлы cookie для улучшения вашего опыта на нашем сайте. Пожалуйста, выберите, какие файлы cookie вы хотите принять.</p>
                    <div class="cookie-consent__buttons">
                        <button class="cookie-consent__button cookie-consent__button--all">Принять все</button>
                        <button class="cookie-consent__button cookie-consent__button--necessary">Только необходимые</button>
                        <button class="cookie-consent__button cookie-consent__button--settings">Настройки</button>
                    </div>
                </div>
            `;
            this.show();
        }
    }

    show() {
        this.notification.classList.add('cookie-consent--visible');
        this.overlay.style.display = 'block';
        this.isVisible = true;
        this.isOverlayVisible = true;
        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.notification.classList.remove('cookie-consent--visible');
        this.overlay.style.display = 'none';
        this.isVisible = false;
        this.isOverlayVisible = false;
        // Разблокируем прокрутку страницы
        document.body.style.overflow = '';
    }

    handleAcceptAll() {
        // Обработка принятия всех cookie
        this.hide();
        // Здесь можно добавить логику сохранения согласия
    }

    handleAcceptNecessary() {
        // Обработка принятия только необходимых cookie
        this.hide();
        // Здесь можно добавить логику сохранения согласия
    }

    handleSettings() {
        // Обработка открытия настроек
        // Здесь можно добавить логику отображения настроек
    }
} 