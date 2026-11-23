/**
 * ==========================================================================
 * SIGNATURE MOTION TYPOGRAPHY SYSTEM
 * Custom split-text engine, character-by-character reveals, 3D metallic
 * typography hover dynamics, kinetic marquee, and scroll storytelling.
 * ==========================================================================
 */

class MotionTypography {
  constructor() {
    this.splitElements = [];
    this.marqueeTracks = [];
    this.init();
  }

  init() {
    // 1. Process all elements tagged for split text
    this.splitTextNodes();

    // 2. Initialize Kinetic 3D Character Hover on Display Headlines
    this.initInteractive3DTilt();

    // 3. Initialize Kinetic Marquee Systems
    this.initMarquee();

    // 4. Initialize Letter Spacing Expand on Scroll
    this.initScrollTypography();
  }

  /**
   * Custom Split-Text Engine
   * Splits elements into lines, words, and characters with overflow-masked wrappers
   * while preserving accessibility with ARIA attributes and supporting <br> line breaks.
   */
  splitTextNodes() {
    const targets = document.querySelectorAll('[data-split]');

    targets.forEach((el) => {
      const splitType = el.getAttribute('data-split'); // 'chars' or 'words'
      
      // If element contains data-i18n children or Bengali text, do not destroy its structure
      if (el.querySelector('[data-i18n]')) {
        return;
      }

      // Preserve original text for screen readers (replacing <br> with spaces)
      const cleanText = el.innerText ? el.innerText.trim() : el.textContent.trim();
      el.setAttribute('aria-label', cleanText);

      // Extract lines by replacing <br> with a special token or reading innerHTML
      const rawHTML = el.innerHTML.replace(/<br\s*[\/]?>/gi, '___LINEBREAK___');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawHTML;
      const fullText = tempDiv.textContent || tempDiv.innerText || '';

      // Bangla text contains complex conjuncts and diacritics that cannot be split into chars
      const isBangla = /[\u0980-\u09FF]/.test(fullText) || document.documentElement.getAttribute('lang') === 'bn';
      if (isBangla && splitType === 'chars') {
        return;
      }

      const lines = fullText.split('___LINEBREAK___');

      // Clear contents and prepare container
      el.innerHTML = '';
      const wrapper = document.createElement('span');
      wrapper.className = 'split-container';

      lines.forEach((lineText, lineIdx) => {
        const trimmedLine = lineText.trim();
        if (!trimmedLine) return;

        const lineWrap = document.createElement('span');
        lineWrap.className = 'split-line-wrap';
        lineWrap.style.display = 'block';

        if (splitType === 'chars') {
          const words = trimmedLine.split(/\s+/);
          words.forEach((word, wordIdx) => {
            const wordWrap = document.createElement('span');
            wordWrap.className = 'split-word-wrap';
            wordWrap.style.display = 'inline-block';
            wordWrap.style.whiteSpace = 'nowrap';

            const chars = word.split('');
            chars.forEach((char) => {
              const charWrap = document.createElement('span');
              charWrap.className = 'split-char-wrap';

              const charInner = document.createElement('span');
              charInner.className = 'split-char';
              charInner.textContent = char;

              charWrap.appendChild(charInner);
              wordWrap.appendChild(charWrap);
            });

            lineWrap.appendChild(wordWrap);

            // Add space between words within the same line
            if (wordIdx < words.length - 1) {
              const space = document.createTextNode(' ');
              lineWrap.appendChild(space);
            }
          });
        } else if (splitType === 'words') {
          const words = trimmedLine.split(/\s+/);
          words.forEach((word, wordIdx) => {
            const wordWrap = document.createElement('span');
            wordWrap.className = 'split-word-wrap';

            const wordInner = document.createElement('span');
            wordInner.className = 'split-word';
            wordInner.textContent = word;

            wordWrap.appendChild(wordInner);
            lineWrap.appendChild(wordWrap);

            if (wordIdx < words.length - 1) {
              const space = document.createTextNode(' ');
              lineWrap.appendChild(space);
            }
          });
        }

        wrapper.appendChild(lineWrap);
      });

      el.appendChild(wrapper);
      this.splitElements.push(el);
    });
  }

  /**
   * Interactive 3D Kinetic Tilt on Characters
   * When cursor hovers over display headlines, nearby characters elevate in 3D perspective
   */
  initInteractive3DTilt() {
    // Skip on touch/mobile devices — tilt causes jank on mobile
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const titles = document.querySelectorAll('.hero-title, .interactive-tilt-title');

    titles.forEach((title) => {
      const chars = title.querySelectorAll('.split-char');
      if (!chars.length) return;

      let rafId = null;
      let lastX = 0, lastY = 0;

      title.addEventListener('mousemove', (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (rafId) return; // throttle: only 1 RAF per frame
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const cursorX = lastX;
          const cursorY = lastY;

          chars.forEach((char) => {
            const charRect = char.getBoundingClientRect();
            const charCenterX = charRect.left + charRect.width / 2;
            const charCenterY = charRect.top + charRect.height / 2;

            const distX = cursorX - charCenterX;
            const distY = cursorY - charCenterY;
            const distance = Math.hypot(distX, distY);

            // Radius of magnetic influence
            const maxDistance = 160;

            if (distance < maxDistance) {
              const power = (1 - distance / maxDistance);
              const translateY = -power * 16;
              const rotateX = distY * -0.15;
              const rotateY = distX * 0.15;
              const scale = 1 + power * 0.14;

              gsap.to(char, {
                y: translateY,
                rotateX: rotateX,
                rotateY: rotateY,
                scale: scale,
                duration: 0.35,
                ease: 'power2.out',
                overwrite: 'auto'
              });
            } else {
              gsap.to(char, {
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.5,
                ease: 'elastic.out(1, 0.4)',
                overwrite: 'auto'
              });
            }
          });
        });
      });

      title.addEventListener('mouseleave', () => {
        gsap.to(chars, {
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.015,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto'
        });
      });
    });
  }

  /**
   * Kinetic Marquee Animation
   * Ensures uninterrupted infinite horizontal translation with dynamic scroll speed-up
   */
  initMarquee() {
    const marquees = document.querySelectorAll('.marquee-track');

    marquees.forEach((marquee) => {
      if (marquee.dataset.marqueeInitialized) return;
      marquee.dataset.marqueeInitialized = 'true';

      const content = marquee.querySelector('.marquee-content');
      if (!content) return;

      // Duplicate content to ensure continuous looping without seam gaps
      const clone = content.cloneNode(true);
      clone.classList.add('is-clone');
      clone.setAttribute('aria-hidden', 'true');
      marquee.appendChild(clone);

      let currentX = 0;
      let targetSpeed = 1.0;
      let scrollSpeed = 0;
      let lastScrollY = window.scrollY;

      // Accelerate marquee slightly on scroll
      window.addEventListener('scroll', () => {
        const delta = Math.abs(window.scrollY - lastScrollY);
        scrollSpeed = delta * 0.15;
        lastScrollY = window.scrollY;
      }, { passive: true });

      const animateMarquee = () => {
        scrollSpeed *= 0.92; // smooth decay
        const totalSpeed = targetSpeed + scrollSpeed;

        currentX -= totalSpeed;
        const contentWidth = content.offsetWidth;

        if (Math.abs(currentX) >= contentWidth) {
          currentX = 0;
        }

        gsap.set(marquee.querySelectorAll('.marquee-content'), {
          x: currentX
        });

        requestAnimationFrame(animateMarquee);
      };

      // Hover to gently slow down
      marquee.addEventListener('mouseenter', () => {
        targetSpeed = 0.3;
      });

      marquee.addEventListener('mouseleave', () => {
        targetSpeed = 1.0;
      });

      requestAnimationFrame(animateMarquee);
    });
  }

  /**
   * Scroll-Driven Typography Transformations
   * Letter-spacing expands dynamically as the user scrolls into view
   */
  initScrollTypography() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Editorial quotes that breathe with scroll
    const scrollStorylines = document.querySelectorAll('.editorial-headline, .section-title');

    scrollStorylines.forEach((title) => {
      gsap.fromTo(
        title,
        { letterSpacing: '-0.04em' },
        {
          letterSpacing: '0.01em',
          scrollTrigger: {
            trigger: title,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }
      );
    });
  }
}

// Global exposure
window.MotionTypography = MotionTypography;
