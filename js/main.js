/**
 * ==========================================================================
 * MAIN ORCHESTRATION SCRIPT - MULTI-PAGE ULTRA-PREMIUM BILINGUAL PORTFOLIO
 * Bootstraps Lenis Smooth Scrolling, Three.js 3D Environment,
 * Typography Engine, GSAP Motion Choreography, and UI Interactions.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log(
    '%c ULTRA-PREMIUM BILINGUAL PORTFOLIO %c\nLight Theme Default | Full Bangla & English Support | Multi-Page Architecture',
    'background: #4565F5; color: #FFF; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    'color: #8265E8; font-style: italic;'
  );

  // 1. Initialize Lenis Smooth Scrolling
  initSmoothScroll();

  // 2. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 3. Initialize Motion Typography Engine
  let typographyInstance = null;
  if (typeof MotionTypography !== 'undefined') {
    typographyInstance = new MotionTypography();
  }

  // 4. Initialize Three.js 3D Hero Environment (only on pages with canvas container)
  let threeSceneInstance = null;
  if (typeof Metallic3DScene !== 'undefined' && document.getElementById('hero-canvas-container')) {
    threeSceneInstance = new Metallic3DScene('hero-canvas-container');
  }

  // 5. Initialize Motion Director (Intro Loader & GSAP ScrollTriggers)
  let motionDirectorInstance = null;
  if (typeof MotionDirector !== 'undefined') {
    motionDirectorInstance = new MotionDirector();
  }

  // 6. Initialize Interactive Controls
  let interactionsInstance = null;
  if (typeof InteractiveExperience !== 'undefined') {
    interactionsInstance = new InteractiveExperience();
  }

  // 7. Sync Dynamic Data from Admin Panel (Non-blocking)
  syncDynamicSiteData();
});

/**
 * Synchronize content dynamically from Admin Panel /api/site-data
 */
async function syncDynamicSiteData() {
  try {
    const res = await fetch('/api/site-data');
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.profile) return;

    const p = data.profile;

    // 1. Update Profile Image
    if (p.profileImage) {
      document.querySelectorAll('.profile-img').forEach(img => {
        if (img.getAttribute('src') !== p.profileImage) {
          img.src = p.profileImage;
        }
      });
    }

    // 2. Update Social Links
    if (p.whatsapp) {
      const cleanWa = p.whatsapp.replace(/^0/, '880').replace(/[^0-9]/g, '');
      document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
        a.href = `https://wa.me/${cleanWa}`;
      });
    }
    if (p.facebook) {
      document.querySelectorAll('a[href*="facebook.com"]').forEach(a => {
        a.href = p.facebook;
      });
    }
    if (p.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
        a.href = p.instagram;
      });
    }

    // 3. Update Global Translation Keys with dynamic Admin Data
    if (window.TRANSLATIONS) {
      if (window.TRANSLATIONS.en) {
        if (p.heroTitleLine1) window.TRANSLATIONS.en.hero_title_1 = p.heroTitleLine1;
        if (p.heroTitleLine2) window.TRANSLATIONS.en.hero_title_2 = p.heroTitleLine2;
        if (p.heroBio) window.TRANSLATIONS.en.hero_bio = p.heroBio;
        if (p.role) window.TRANSLATIONS.en.hero_role = p.role;
        if (p.status) window.TRANSLATIONS.en.status_commissions = p.status;
        if (Array.isArray(data.marquee)) {
          data.marquee.forEach((m, idx) => {
            if (m.en) window.TRANSLATIONS.en[`marquee_${idx + 1}`] = m.en;
          });
        }
      }

      if (window.TRANSLATIONS.bn) {
        if (p.heroTitleLine1Bn) window.TRANSLATIONS.bn.hero_title_1 = p.heroTitleLine1Bn;
        if (p.heroTitleLine2Bn) window.TRANSLATIONS.bn.hero_title_2 = p.heroTitleLine2Bn;
        if (p.heroBioBn) window.TRANSLATIONS.bn.hero_bio = p.heroBioBn;
        if (p.roleBn) window.TRANSLATIONS.bn.hero_role = p.roleBn;
        if (p.statusBn) window.TRANSLATIONS.bn.status_commissions = p.statusBn;
        if (Array.isArray(data.marquee)) {
          data.marquee.forEach((m, idx) => {
            if (m.bn) window.TRANSLATIONS.bn[`marquee_${idx + 1}`] = m.bn;
          });
        }
      }

      // Re-apply current language texts
      const currentLang = document.documentElement.getAttribute('lang') || 'en';
      const dict = window.TRANSLATIONS[currentLang];
      if (dict) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (dict[key] !== undefined && !dict[key].includes('<')) {
            el.textContent = dict[key];
          }
        });
      }
    }
  } catch (e) {
    // Graceful offline fallback
  }
}

/**
 * Lenis Smooth Scrolling with GSAP ScrollTrigger Synchronization
 */
function initSmoothScroll() {
  if (typeof Lenis === 'undefined') {
    return;
  }

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 2.0,
    infinite: false
  });

  window.lenis = lenis;

  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(500, 33);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Anchor Smooth Scrolling for internal page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, { offset: -60, duration: 1.4 });
        }
      }
    });
  });
}
