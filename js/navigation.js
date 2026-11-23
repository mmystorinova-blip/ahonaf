/**
 * ==========================================================================
 * MULTI-PAGE NAVIGATION & FOOTER CONTROLLER
 * Active route detection, sticky navbar, mobile drawer, clock, & back-to-top.
 * ==========================================================================
 */

class NavigationManager {
  constructor() {
    this.initActiveRoute();
    this.initNavbarScroll();
    this.initMobileMenu();
    this.initBackToTop();
    this.initLiveClock();
  }

  /**
   * Detect current page URL and highlight active nav link
   */
  initActiveRoute() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.split('/').pop();

      // Check match
      const isHomeMatch = (currentPath === '' || currentPath === 'index.html') && (linkPath === 'index.html' || linkPath === './' || linkPath === '/');
      const isPageMatch = currentPath === linkPath;

      if (isHomeMatch || isPageMatch) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Sticky Navbar on Scroll
   */
  initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 30) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /**
   * Fullscreen Mobile Menu
   */
  initMobileMenu() {
    const hamburger = document.querySelector('.btn-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, #mobile-menu a');

    if (!hamburger || !mobileMenu) return;

    const toggleMenu = (e) => {
      if (e) e.stopPropagation();
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close when clicking outside menu
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /**
   * Back-to-Top Button with Circular SVG Progress Ring
   */
  initBackToTop() {
    const btn = document.querySelector('.btn-back-to-top');
    const ringCircle = document.querySelector('.progress-ring-circle');
    const progressBar = document.getElementById('scroll-progress-bar');

    if (!btn) return;

    btn.addEventListener('click', () => {
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    window.addEventListener('scroll', () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTotal > 0 ? window.scrollY / scrollTotal : 0;

      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }

      if (ringCircle) {
        const offset = 157 - (progress * 157);
        ringCircle.style.strokeDashoffset = offset;
      }
    }, { passive: true });
  }

  /**
   * Live Dhaka Clock Widget (Bilingual)
   */
  initLiveClock() {
    const clockDisplays = document.querySelectorAll('#live-clock');
    if (!clockDisplays.length) return;

    const updateClock = () => {
      const isBangla = document.documentElement.getAttribute('lang') === 'bn';
      const now = new Date();

      const options = {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };

      const locale = isBangla ? 'bn-BD' : 'en-US';
      const formatter = new Intl.DateTimeFormat(locale, options);
      const timeStr = formatter.format(now);

      clockDisplays.forEach((el) => {
        el.textContent = timeStr;
      });
    };

    updateClock();
    setInterval(updateClock, 1000);

    window.addEventListener('languageChanged', updateClock);
  }
}

// Global exposure
window.navigationManager = new NavigationManager();
