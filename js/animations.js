/**
 * ==========================================================================
 * ANIMATIONS SYSTEM - GSAP & SCROLLTRIGGER CHOREOGRAPHY
 * Intro loader sequence, cinematic hero reveal, scroll-triggered reveals,
 * animated metrics counters, timeline progress, and image masks.
 * ==========================================================================
 */

class MotionDirector {
  constructor() {
    this.initGSAP();
    this.initIntroSequence();
    this.initScrollReveals();
    this.initMetricsCounter();
    this.initTimelineProgress();
    this.initImageMasks();
  }

  initGSAP() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP library not detected.');
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  /**
   * Cinematic Intro Loading Sequence
   * Monogram pulse -> Tagline character reveal -> Counter 0 to 100% -> Curtain Split
   */
  initIntroSequence() {
    const loader = document.getElementById('loader');
    const counterEl = document.querySelector('.loader-counter');
    const progressBar = document.querySelector('.loader-progress-bar');
    const curtains = document.querySelectorAll('.curtain-panel');

    if (!loader || !counterEl) {
      this.playHeroEntrance();
      return;
    }

    // Check if intro has already run in this session
    if (sessionStorage.getItem('portfolio_intro_seen')) {
      loader.style.display = 'none';
      this.playHeroEntrance();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            loader.style.display = 'none';
            try {
              sessionStorage.setItem('portfolio_intro_seen', 'true');
            } catch (e) {}
            this.playHeroEntrance();
          }
        });
      }
    });

    // 1. Monogram & Initial Brand Appearance
    tl.fromTo(
      '.loader-logo-icon, .loader-brand-title, .loader-status',
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );

    // 2. Tagline Reveal
    tl.fromTo(
      '.loader-tagline',
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' },
      '-=0.3'
    );

    // 3. Counter 0 to 100% & Progress Bar filling
    const counterObj = { value: 0 };
    tl.to(counterObj, {
      value: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.floor(counterObj.value);
        counterEl.textContent = val < 10 ? `0${val}%` : `${val}%`;
        if (progressBar) {
          progressBar.style.width = `${val}%`;
        }
      }
    }, '-=0.4');

    // 4. Shutter Curtain Exit Animation
    if (curtains.length) {
      tl.to(curtains, {
        scaleY: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power4.inOut'
      }, '+=0.1');
    }
  }

  /**
   * Hero Entrance Sequence
   * Triggered immediately after loader completes
   */
  playHeroEntrance() {
    const heroTl = gsap.timeline();

    // 1. Meta row & eyebrows
    heroTl.fromTo(
      '.meta-status-chip, .hero-role-badge',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }
    );

    // 2. Hero Headline Reveal (Lines or Split Characters)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      const titleLines = heroTitle.querySelectorAll('.hero-title-line');
      const chars = heroTitle.querySelectorAll('.split-char');

      if (titleLines.length) {
        heroTl.fromTo(
          titleLines,
          {
            y: 35,
            opacity: 0,
            filter: 'blur(8px)'
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out'
          },
          '-=0.4'
        );
      } else if (chars.length) {
        heroTl.fromTo(
          chars,
          {
            y: '120%',
            rotateX: -60,
            opacity: 0,
            filter: 'blur(8px)'
          },
          {
            y: '0%',
            rotateX: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.0,
            stagger: 0.02,
            ease: 'power4.out'
          },
          '-=0.4'
        );
      } else {
        heroTl.fromTo(
          heroTitle,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        );
      }
    }

    // 3. Hero Bio & Profile Visual Card
    heroTl.fromTo(
      '.hero-bio',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );

    heroTl.fromTo(
      '.profile-frame-outer',
      { opacity: 0, scale: 0.9, rotateY: 15 },
      { opacity: 1, scale: 1, rotateY: 0, duration: 1.1, ease: 'power3.out' },
      '-=0.7'
    );

    // 4. Floating Badges / Feature Pills Stagger
    const pillTargets = document.querySelectorAll('.hero-feature-pill, .floating-badge');
    if (pillTargets.length) {
      heroTl.fromTo(
        pillTargets,
        { opacity: 0, scale: 0.7, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'back.out(1.7)' },
        '-=0.5'
      );
    }

    // 5. CTAs & Social Links
    heroTl.fromTo(
      '.hero-cta-group .btn',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
      '-=0.4'
    );

    heroTl.fromTo(
      '.hero-socials .social-link',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      '-=0.4'
    );

    // 6. Scroll Indicator
    heroTl.fromTo(
      '.hero-scroll-indicator',
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.2'
    );
  }

  /**
   * Scroll-Triggered Section Reveals
   */
  initScrollReveals() {
    if (typeof ScrollTrigger === 'undefined') return;

    // Section Titles Masked Slide Up
    const sectionTitles = document.querySelectorAll('.section-title, .section-title-sm');
    sectionTitles.forEach((title) => {
      const chars = title.querySelectorAll('.split-char');
      if (chars.length) {
        gsap.fromTo(
          chars,
          {
            y: '100%',
            opacity: 0,
            rotateX: -45
          },
          {
            y: '0%',
            opacity: 1,
            rotateX: 0,
            duration: 0.85,
            stagger: 0.02,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      } else {
        gsap.fromTo(
          title,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 85%'
            }
          }
        );
      }
    });

    // Skill Cards Stagger Rise
    const skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length) {
      gsap.fromTo(
        skillCards,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.skills-grid',
            start: 'top 80%'
          }
        }
      );
    }

    // Service Cards Stagger
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, idx) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay: idx * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%'
          }
        }
      );
    });

    // Project Cards Reveal
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, idx) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          delay: (idx % 2) * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%'
          }
        }
      );
    });

    // About Pillars Stagger
    const pillars = document.querySelectorAll('.pillar-card');
    if (pillars.length) {
      gsap.fromTo(
        pillars,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.about-pillars',
            start: 'top 85%'
          }
        }
      );
    }
  }

  /**
   * Animated Metrics Counter
   * Smoothly animates numbers from 0 up to actual target
   */
  initMetricsCounter() {
    if (typeof ScrollTrigger === 'undefined') return;

    const metricItems = document.querySelectorAll('.metric-val[data-target]');
    metricItems.forEach((metric) => {
      const targetStr = metric.getAttribute('data-target');
      const suffix = metric.getAttribute('data-suffix') || '';
      const targetNum = parseFloat(targetStr);
      const isDecimal = targetStr.includes('.');

      const counterObj = { count: 0 };

      ScrollTrigger.create({
        trigger: metric,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(counterObj, {
            count: targetNum,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              if (isDecimal) {
                metric.textContent = counterObj.count.toFixed(1) + suffix;
              } else {
                metric.textContent = Math.floor(counterObj.count) + suffix;
              }
            }
          });
        }
      });
    });
  }

  /**
   * Experience Timeline Progress Bar
   * Fills the vertical central spine as user scrolls through the journey
   */
  initTimelineProgress() {
    if (typeof ScrollTrigger === 'undefined') return;

    const timelineWrap = document.querySelector('.timeline-wrap');
    const fillBar = document.querySelector('.timeline-progress-fill');

    if (!timelineWrap || !fillBar) return;

    ScrollTrigger.create({
      trigger: timelineWrap,
      start: 'top 70%',
      end: 'bottom 70%',
      scrub: true,
      onUpdate: (self) => {
        fillBar.style.height = `${self.progress * 100}%`;
      }
    });

    // Timeline items reveal
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
      const card = item.querySelector('.timeline-content-card');
      const node = item.querySelector('.timeline-node');

      gsap.fromTo(
        card,
        { opacity: 0, x: item.classList.contains('timeline-item-right') ? 50 : -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%'
          }
        }
      );

      gsap.fromTo(
        node,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%'
          }
        }
      );
    });
  }

  /**
   * Editorial Image Mask Reveals
   * Clip-path animation creating an ultra-luxury magazine entrance
   */
  initImageMasks() {
    const maskedFrames = document.querySelectorAll('.about-editorial-frame, .profile-frame-outer');

    maskedFrames.forEach((frame) => {
      gsap.fromTo(
        frame,
        {
          clipPath: 'inset(10% 10% 10% 10% round 20px)'
        },
        {
          clipPath: 'inset(0% 0% 0% 0% round 20px)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: frame,
            start: 'top 80%'
          }
        }
      );
    });
  }
}

// Global exposure
window.MotionDirector = MotionDirector;
