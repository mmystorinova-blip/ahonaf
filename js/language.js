/**
 * ==========================================================================
 * LANGUAGE CONTROLLER - BILINGUAL (BANGLA & ENGLISH)
 * Persistent language preference, instant DOM translation, and event dispatch.
 * ==========================================================================
 */

class LanguageManager {
  constructor() {
    this.currentLang = localStorage.getItem('portfolio_lang') || 'en';
    this.init();
  }

  init() {
    // 1. Set initial language on HTML root
    this.applyLanguage(this.currentLang, false);

    // 2. Bind language toggle click events
    this.bindEvents();
  }

  /**
   * Set and apply language
   * @param {string} lang - 'en' or 'bn'
   * @param {boolean} notify - whether to dispatch change event
   */
  applyLanguage(lang, notify = true) {
    if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) {
      console.warn(`Translation dictionary for "${lang}" not found.`);
      return;
    }

    this.currentLang = lang;
    localStorage.setItem('portfolio_lang', lang);

    // Update <html lang="...">
    document.documentElement.setAttribute('lang', lang);

    const dict = window.TRANSLATIONS[lang];

    // 1. Update text/html for all elements with data-i18n
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        // If element contains HTML or child icons, handle cleanly
        if (el.getAttribute('data-i18n-mode') === 'html' || dict[key].includes('<')) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 2. Update placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // 3. Update titles / tooltips
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) {
        el.setAttribute('title', dict[key]);
      }
    });

    // 4. Update aria-labels
    const ariaElements = document.querySelectorAll('[data-i18n-aria]');
    ariaElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) {
        el.setAttribute('aria-label', dict[key]);
      }
    });

    // 5. Update language switcher button states
    const langBtns = document.querySelectorAll('[data-lang-btn]');
    langBtns.forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang-btn');
      if (btnLang === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // 6. Refresh Lucide Icons if any were replaced
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // 7. Dispatch language changed event
    if (notify) {
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang-btn]');
      if (btn) {
        e.preventDefault();
        const selectedLang = btn.getAttribute('data-lang-btn');
        if (selectedLang !== this.currentLang) {
          this.applyLanguage(selectedLang);
        }
      }
    });
  }

  getTranslation(key) {
    const dict = window.TRANSLATIONS[this.currentLang] || window.TRANSLATIONS['en'];
    return dict[key] || key;
  }
}

// Global exposure
window.languageManager = new LanguageManager();
