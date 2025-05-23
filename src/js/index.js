// Импортируем все классы
import { CookieConsent } from './cookie-consent.js';
import { ConsentNotification } from './consent-notification.js';

// Экспортируем класс для использования
export { CookieConsent };

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const cookieConsent = new CookieConsent();
    cookieConsent.show();
}); 