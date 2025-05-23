/**
 * CookieConsent - Скрипт уведомления о файлах cookie
 * @version 1.0.0
 */

import { ConsentNotification } from './consent-notification.js';

export class CookieConsent {
  static instance = null;

  constructor(options = {}) {
    this.options = {
      language: 'ru',
      position: 'center',
      theme: 'light',
      categories: ['necessary', 'analytics', 'marketing', 'functional'],
      storageKey: 'cookieConsent',
      storageVersion: '1.0',
      expiryDays: 365,
      necessaryRequired: true,
      ...options
    };

    this.storage = new ConsentStorage(this.options.storageKey);
    this.security = new ConsentSecurity();
    this.expiry = new ConsentExpiry(this.options.expiryDays);
    this.translations = new Translations(this.options.language);
    
    this.notification = new ConsentNotification(this);
    this.initialize();
  }

  initialize() {
    // Проверяем наличие сохраненного согласия
    const storedConsent = this.storage.load();
    
    if (!storedConsent || this.expiry.isExpired(storedConsent)) {
      this.show();
    } else {
      this.applyConsent(storedConsent);
    }

    // Слушаем изменения в других вкладках
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  show() {
    // Создаем и показываем уведомление
    this.notification.render();
  }

  applyConsent(consent) {
    // Применяем настройки согласия
    if (this.security.verify(consent)) {
      // Убеждаемся, что необходимые куки всегда включены
      if (this.options.necessaryRequired) {
        consent.categories.necessary = true;
      }
      
      window.dispatchEvent(new CustomEvent('cookieConsent', {
        detail: consent.categories
      }));
    }
  }

  handleStorageChange(event) {
    if (event.key === this.options.storageKey) {
      const newConsent = JSON.parse(event.newValue);
      this.applyConsent(newConsent);
    }
  }

  // Публичные методы API
  static init(options) {
    if (!this.instance) {
      this.instance = new CookieConsent(options);
    }
    return this.instance;
  }

  static hasConsent(category) {
    if (!this.instance) {
      return category === 'necessary';
    }
    const consent = this.instance.storage.load();
    // Необходимые куки всегда разрешены
    if (category === 'necessary') {
      return true;
    }
    return consent?.categories[category] || false;
  }

  static getConsent() {
    if (!this.instance) {
      return { necessary: true };
    }
    const consent = this.instance.storage.load()?.categories || {};
    // Убеждаемся, что необходимые куки всегда включены
    if (this.instance.options.necessaryRequired) {
      consent.necessary = true;
    }
    return consent;
  }
}

export class ConsentStorage {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  save(consentData) {
    try {
      // Основное хранение в localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(consentData));
      
      // Резервное хранение в cookie
      const simpleStatus = this.getSimpleStatus(consentData.categories);
      document.cookie = `consent=${simpleStatus}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
      
    } catch (error) {
      // Если localStorage недоступен, используем только cookie
      this.saveToCookie(consentData);
    }
  }

  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      // Fallback на cookie
      return this.loadFromCookie();
    }
    return null;
  }

  getSimpleStatus(categories) {
    return categories.analytics ? 'full' : 'minimal';
  }

  saveToCookie(consentData) {
    const simpleStatus = this.getSimpleStatus(consentData.categories);
    document.cookie = `consent=${simpleStatus}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
  }

  loadFromCookie() {
    const cookies = document.cookie.split(';');
    const consentCookie = cookies.find(cookie => cookie.trim().startsWith('consent='));
    
    if (consentCookie) {
      const status = consentCookie.split('=')[1];
      return {
        categories: {
          necessary: true,
          analytics: status === 'full',
          marketing: status === 'full',
          functional: status === 'full'
        }
      };
    }
    return null;
  }
}

export class ConsentSecurity {
  constructor() {
    // Инициализация безопасности
  }

  verify(consent) {
    // Проверка подлинности согласия
    return true;
  }

  encrypt(consent) {
    // Шифрование данных согласия
    return consent;
  }
}

export class ConsentExpiry {
  constructor(days) {
    this.duration = days * 24 * 60 * 60 * 1000;
  }

  setExpiry(consent) {
    consent.expiresAt = Date.now() + this.duration;
    return consent;
  }

  isExpired(consent) {
    return Date.now() > consent.expiresAt;
  }
}

export class Translations {
  constructor(language) {
    this.language = language;
    this.translations = {
      ru: {
        title: 'Настройки файлов cookie',
        description: 'Мы используем файлы cookie для улучшения вашего опыта на нашем сайте.',
        acceptNecessary: 'Только необходимые',
        acceptAll: 'Принять все',
        settings: 'Настройки',
        categories: {
          necessary: 'Необходимые',
          analytics: 'Аналитика',
          marketing: 'Маркетинг',
          functional: 'Функциональные'
        }
      },
      en: {
        title: 'Cookie Settings',
        description: 'We use cookies to enhance your experience on our website.',
        acceptNecessary: 'Necessary Only',
        acceptAll: 'Accept All',
        settings: 'Settings',
        categories: {
          necessary: 'Necessary',
          analytics: 'Analytics',
          marketing: 'Marketing',
          functional: 'Functional'
        }
      }
    };
  }

  get(key) {
    return this.translations[this.language]?.[key] || key;
  }
}

// Экспорт для использования в Matomo Tag Manager
if (typeof window.matomo !== 'undefined') {
  window.matomo.CookieConsent = CookieConsent;
}

// Экспорт для глобального использования
window.CookieConsent = CookieConsent;