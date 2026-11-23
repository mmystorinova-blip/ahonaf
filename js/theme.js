/**
 * ==========================================================================
 * THEME CONTROLLER - DUAL THEME (DEFAULT: LIGHT | OPTIONAL: DARK)
 * Manages theme persistence across all individual pages and dispatches events.
 * ==========================================================================
 */

class ThemeManager {
  constructor() {
    // Default is light theme as requested!
    this.currentTheme = localStorage.getItem('portfolio_theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme, false);
    this.bindEvents();
  }

  applyTheme(theme, notify = true) {
    this.currentTheme = theme;
    localStorage.setItem('portfolio_theme', theme);

    // Apply attribute on <html>
    document.documentElement.setAttribute('data-theme', theme);

    // Update theme toggle button icons across page
    const themeButtons = document.querySelectorAll('.btn-theme-toggle');
    themeButtons.forEach((btn) => {
      const icon = btn.querySelector('i');
      if (icon) {
        // In light mode show moon icon (to switch to dark), in dark mode show sun icon
        icon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
      }
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    if (notify) {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(nextTheme);
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-theme-toggle');
      if (btn) {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
}

// Global exposure
window.themeManager = new ThemeManager();
