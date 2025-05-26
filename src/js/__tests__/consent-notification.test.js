import { ConsentNotification } from '../consent-notification';
import { cookieConsentConfig } from '../cookie-consent-config';

describe('ConsentNotification', () => {
  let consentNotification;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'cookie-consent-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    if (consentNotification) {
      consentNotification.destroy();
    }
  });

  describe('initialization', () => {
    it('should create a singleton instance', () => {
      const instance1 = new ConsentNotification(cookieConsentConfig);
      const instance2 = new ConsentNotification(cookieConsentConfig);
      expect(instance1).toBe(instance2);
    });

    it('should throw error if config is missing required fields', () => {
      const invalidConfig = { ...cookieConsentConfig };
      delete invalidConfig.categories;
      expect(() => new ConsentNotification(invalidConfig)).toThrow();
    });

    it('should initialize with default settings', () => {
      consentNotification = new ConsentNotification(cookieConsentConfig);
      expect(consentNotification.config).toBe(cookieConsentConfig);
      expect(consentNotification.isInitialized).toBe(true);
    });
  });

  describe('modal rendering', () => {
    beforeEach(() => {
      consentNotification = new ConsentNotification(cookieConsentConfig);
    });

    it('should render initial modal', () => {
      consentNotification.showModal('initial');
      const modal = document.querySelector('.cookie-consent');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('cookie-consent--initial');
    });

    it('should render experience improve modal', () => {
      consentNotification.showModal('experienceImprove');
      const modal = document.querySelector('.cookie-consent');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('cookie-consent--experience-improve');
    });

    it('should render settings modal', () => {
      consentNotification.showModal('firstVisitSettings');
      const modal = document.querySelector('.cookie-consent');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('cookie-consent--settings');
    });
  });

  describe('cookie handling', () => {
    beforeEach(() => {
      consentNotification = new ConsentNotification(cookieConsentConfig);
    });

    it('should set necessary cookies on accept', () => {
      consentNotification.handleAcceptNecessary();
      expect(document.cookie).toContain('cookie_consent_necessary=true');
    });

    it('should set all cookies on accept all', () => {
      consentNotification.handleAcceptAll();
      expect(document.cookie).toContain('cookie_consent_necessary=true');
      expect(document.cookie).toContain('cookie_consent_analytics=true');
      expect(document.cookie).toContain('cookie_consent_marketing=true');
      expect(document.cookie).toContain('cookie_consent_functional=true');
    });

    it('should set selected cookies on accept selected', () => {
      const selectedCategories = ['necessary', 'analytics'];
      consentNotification.handleAcceptSelected(selectedCategories);
      expect(document.cookie).toContain('cookie_consent_necessary=true');
      expect(document.cookie).toContain('cookie_consent_analytics=true');
      expect(document.cookie).not.toContain('cookie_consent_marketing=true');
      expect(document.cookie).not.toContain('cookie_consent_functional=true');
    });
  });

  describe('script loading', () => {
    beforeEach(() => {
      consentNotification = new ConsentNotification(cookieConsentConfig);
    });

    it('should load necessary scripts', () => {
      const loadScriptSpy = jest.spyOn(consentNotification, 'loadScript');
      consentNotification.handleAcceptNecessary();
      expect(loadScriptSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'necessary'
        })
      );
    });

    it('should load all scripts on accept all', () => {
      const loadScriptSpy = jest.spyOn(consentNotification, 'loadScript');
      consentNotification.handleAcceptAll();
      expect(loadScriptSpy).toHaveBeenCalledTimes(
        Object.keys(cookieConsentConfig.categories).length
      );
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      consentNotification = new ConsentNotification(cookieConsentConfig);
    });

    it('should handle close button click', () => {
      consentNotification.showModal('initial');
      const closeButton = document.querySelector('.cookie-consent__close');
      const hideSpy = jest.spyOn(consentNotification, 'hide');
      closeButton.click();
      expect(hideSpy).toHaveBeenCalled();
    });

    it('should handle overlay click when enabled', () => {
      consentNotification.showModal('initial');
      const overlay = document.querySelector('.cookie-consent-overlay');
      const hideSpy = jest.spyOn(consentNotification, 'hide');
      overlay.click();
      expect(hideSpy).toHaveBeenCalled();
    });

    it('should not handle overlay click when disabled', () => {
      consentNotification.showModal('firstVisitSettings');
      const overlay = document.querySelector('.cookie-consent-overlay');
      const hideSpy = jest.spyOn(consentNotification, 'hide');
      overlay.click();
      expect(hideSpy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      consentNotification = new ConsentNotification(cookieConsentConfig);
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('should handle script loading errors', () => {
      const errorScript = {
        category: 'necessary',
        src: 'invalid-script.js'
      };
      consentNotification.loadScript(errorScript);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle invalid modal type', () => {
      expect(() => consentNotification.showModal('invalidType')).toThrow();
    });
  });
}); 