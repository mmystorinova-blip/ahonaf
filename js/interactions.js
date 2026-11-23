/**
 * ==========================================================================
 * INTERACTIONS & UI CONTROLS SYSTEM
 * Custom cursor, magnetic buttons, 3D card tilt, project filters,
 * project details page dynamic loader, contact form validation, and audio synth.
 * ==========================================================================
 */

class InteractiveExperience {
  constructor() {
    this.audioEnabled = false;
    this.audioCtx = null;

    this.initCursor();
    this.initMagneticButtons();
    this.initCardTilt();
    this.initProjectFilters();
    this.initSkillFilters();
    this.initProjectDetailsPage();
    this.initContactForm();
    this.initAudioFeedback();
    this.initCopyEmail();
  }

  /**
   * Custom Lerping Cursor with Trailing Ring
   */
  initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    const hoverTargets = document.querySelectorAll(
      'a, button, input, select, textarea, .skill-card, .service-card, .project-card, .btn, .clickable'
    );

    hoverTargets.forEach((target) => {
      target.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        this.playHoverTone();
      });
      target.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });

    document.addEventListener('mouseleave', () => {
      document.body.classList.add('cursor-hidden');
    });

    document.addEventListener('mouseenter', () => {
      document.body.classList.remove('cursor-hidden');
    });
  }

  /**
   * Magnetic Button Spring Physics
   */
  initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magneticElements = document.querySelectorAll('.magnetic-target, .btn-primary, .btn-secondary, .social-link');

    magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;

        gsap.to(el, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)',
          overwrite: 'auto'
        });
      });
    });
  }

  /**
   * 3D Card Tilt with Specular Glare
   */
  initCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cards = document.querySelectorAll('.skill-card, .service-card, .project-card, .profile-frame-outer');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1000,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto'
        });
      });
    });
  }

  /**
   * Project Category Filtering
   */
  initProjectFilters() {
    const filterButtons = document.querySelectorAll('.project-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.playClickSound();

        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        projectCards.forEach((card) => {
          const cardCategory = card.getAttribute('data-category');
          const isMatch = category === 'all' || cardCategory === category;

          if (isMatch) {
            gsap.to(card, {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              display: 'flex',
              ease: 'power2.out'
            });
          } else {
            gsap.to(card, {
              scale: 0.9,
              opacity: 0,
              duration: 0.3,
              display: 'none',
              ease: 'power2.in'
            });
          }
        });
      });
    });
  }

  /**
   * Skill Category Filtering
   */
  initSkillFilters() {
    const filterButtons = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    if (!filterButtons.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.playClickSound();

        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        skillCards.forEach((card) => {
          const cardCategory = card.getAttribute('data-category');
          const isMatch = category === 'all' || cardCategory === category;

          if (isMatch) {
            gsap.to(card, {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              display: 'block',
              ease: 'power2.out'
            });
          } else {
            gsap.to(card, {
              scale: 0.9,
              opacity: 0,
              duration: 0.3,
              display: 'none',
              ease: 'power2.in'
            });
          }
        });
      });
    });
  }

  /**
   * Project Details Page Dynamic Data Loader
   * Reads URL query param `?project=project-X` and populates the project details page
   */
  initProjectDetailsPage() {
    const detailsContainer = document.querySelector('.project-details-container');
    if (!detailsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project') || 'project-1';

    const projectsList = ['project-1', 'project-2', 'project-3', 'project-4', 'project-5', 'project-6'];
    const currentIndex = projectsList.indexOf(projectId) !== -1 ? projectsList.indexOf(projectId) : 0;
    const prevIndex = (currentIndex - 1 + projectsList.length) % projectsList.length;
    const nextIndex = (currentIndex + 1) % projectsList.length;

    const prevProjectId = projectsList[prevIndex];
    const nextProjectId = projectsList[nextIndex];

    const projectData = {
      'project-1': {
        titleKey: 'project1_title',
        catKey: 'project1_cat',
        image: 'assets/images/project-1.jpg',
        fullKey: 'project1_full',
        client: 'AI Video Production',
        timeline: '1 Week Sprint',
        tools: 'AI Video Creation Tools, CapCut, Sound Design',
        deliverables: 'Full HD / 4K Video, Sound Design, 9:16 Social Cuts',
        challengeEn: 'Creating engaging visual concepts with high visual impact using AI-assisted video workflows.',
        challengeBn: 'এআই-সহায়তা ভিডিও পাইপলাইনের মাধ্যমে আধুনিক ও দৃষ্টিনন্দন ভিজ্যুয়াল কনসেপ্ট তৈরি করা।',
        solutionEn: 'Utilized cutting-edge AI content creation tools combined with human direction, rhythm editing, and layered sound effects.',
        solutionBn: 'আধুনিক এআই টুলস এবং সৃজনশীল ভিডিও এডিটিং ও সাউন্ড ইফেক্টসের চমৎকার মেলবন্ধন।'
      },
      'project-2': {
        titleKey: 'project2_title',
        catKey: 'project2_cat',
        image: 'assets/images/project-2.jpg',
        fullKey: 'project2_full',
        client: 'YouTube Creator Channel',
        timeline: 'Weekly Delivery',
        tools: 'CapCut, YouTube Studio, Audio Layering',
        deliverables: 'Full-Length YouTube Video, Custom Sound Effects, Pattern Interrupts',
        challengeEn: 'Maintaining viewer retention and watch time throughout long-form educational & entertainment content.',
        challengeBn: 'ইউটিউবে দীর্ঘ সময় জুড়ে দর্শকের মনোযোগ ধরে রাখা এবং ওয়াচ টাইম বৃদ্ধি করা।',
        solutionEn: 'Structured intentional pattern interrupts, dynamic b-roll inserts, kinetic text pop-ups, and balanced audio leveling.',
        solutionBn: 'পরিকল্পিত প্যাটার্ন ইন্টারাপ্ট, প্রাসঙ্গিক বি-রোল, ডায়নামিক টেক্সট এবং নিখুঁত অডিও ব্যালেন্সিংয়ের মাধ্যমে ভিডিও সম্পন্ন করা।'
      },
      'project-3': {
        titleKey: 'project3_title',
        catKey: 'project3_cat',
        image: 'assets/images/project-3.jpg',
        fullKey: 'project3_full',
        client: 'Social Media Growth Series',
        timeline: '3 Days Turnaround',
        tools: 'CapCut, Mobile Production, Trending Audio',
        deliverables: '10+ Vertical Videos (9:16), High-Hook Architecture, Viral Captions',
        challengeEn: 'Capturing viewer attention in the first 3 seconds across YouTube Shorts and Instagram Reels.',
        challengeBn: 'ইউটিউব শর্টস ও ইনস্টাগ্রাম রিলসে প্রথম ৩ সেকেন্ডে দর্শকের সম্পূর্ণ মনোযোগ আকর্ষণ করা।',
        solutionEn: 'Designed fast hook sequences, rapid-fire jump cuts, animated captions, and sync with trending audio tracks.',
        solutionBn: 'আকর্ষণীয় হুক সিকোয়েন্স, দ্রুত জাম্প কাট, রঙিন ক্যাপশন এবং ট্রেন্ডিং অডিওর নিখুঁত সিঙ্ক।'
      },
      'project-4': {
        titleKey: 'project4_title',
        catKey: 'project4_cat',
        image: 'assets/images/project-4.jpg',
        fullKey: 'project4_full',
        client: 'Creative Portfolio Showcase',
        timeline: '4 Days Sprint',
        tools: 'CapCut, Speed Ramping, Keyframe Animation',
        deliverables: 'Creative Showcase Reel, Custom Transitions, Velocity Curve Cuts',
        challengeEn: 'Showcasing advanced video transitions and creative pacing within short-form formats.',
        challengeBn: 'শর্ট-ফর্ম ভিডিও ফরম্যাটে বৈচিত্র্যময় ট্রানজিশন ও গতিশীল পেসিং ফুটিয়ে তোলা।',
        solutionEn: 'Applied custom velocity curves, smooth zoom transitions, keyframe tracking, and rhythmic sound effects.',
        solutionBn: 'কাস্টম ভেলোসিটি কার্ভ, মসৃণ জুম ট্রানজিশন, কি-ফ্রেম ট্র্যাকিং এবং রিদমিক সাউন্ডের সমন্বয়।'
      },
      'project-5': {
        titleKey: 'project5_title',
        catKey: 'project5_cat',
        image: 'assets/images/project-5.jpg',
        fullKey: 'project5_full',
        client: 'Motion Branding Package',
        timeline: '1 Week Sprint',
        tools: 'Adobe After Effects, Motion Graphics, Typography',
        deliverables: 'Animated Intros, Kinetic Titles, Lower Thirds, Motion Accents',
        challengeEn: 'Enhancing video productions with branded motion graphics and clean kinetic text.',
        challengeBn: 'ভিডিও প্রোডাকশনে ব্র্যান্ডেড মোশন গ্রাফিক্স ও পরিচ্ছন্ন টেক্সট অ্যানিমেশন যুক্ত করা।',
        solutionEn: 'Created custom typography reveals, lower third graphic overlays, and animated badges in Adobe After Effects.',
        solutionBn: 'অ্যাডোবি আফটার ইফেক্টসে কাস্টম টাইপোগ্রাফি রিভিল, লোয়ার থার্ড গ্রাফিক্স ও অ্যানিমেটেড ব্যাজ ডিজাইন।'
      },
      'project-6': {
        titleKey: 'project6_title',
        catKey: 'project6_cat',
        image: 'assets/images/project-6.jpg',
        fullKey: 'project6_full',
        client: 'Digital Campaign Assets',
        timeline: '2 Days Delivery',
        tools: 'Graphic Design, Marketing Layout, Social Media Tools',
        deliverables: 'Social Media Banners, YouTube Thumbnails, Marketing Creatives',
        challengeEn: 'Designing high-click-through promotional banners and thumbnails for marketing campaigns.',
        challengeBn: 'মার্কেটিং ক্যাম্পেইনের জন্য হাই-ক্লিক-থ্রু প্রোমোশনাল ব্যানার এবং ইউটিউব থাম্বনেইল ডিজাইন।',
        solutionEn: 'Crafted bold visual hierarchy, clean contrast, crisp typography, and compelling marketing call-to-actions.',
        solutionBn: 'স্পষ্ট ভিজ্যুয়াল হায়ারার্কি, চমৎকার কনট্রাস্ট এবং স্পষ্ট কল-টু-অ্যাকশনের মাধ্যমে ব্যানার প্রস্তুত।'
      }
    };

    const currentData = projectData[projectId] || projectData['project-1'];

    // Update Project Image
    const projectImg = detailsContainer.querySelector('.project-hero-img');
    if (projectImg) projectImg.src = currentData.image;

    // Update Metadata
    const updateProjectContent = () => {
      const isBn = document.documentElement.getAttribute('lang') === 'bn';
      const dict = window.TRANSLATIONS ? (window.TRANSLATIONS[isBn ? 'bn' : 'en'] || window.TRANSLATIONS['en']) : {};

      const titleEl = detailsContainer.querySelector('.project-details-title');
      const catEl = detailsContainer.querySelector('.project-details-category');
      const fullDescEl = detailsContainer.querySelector('.project-details-full');
      const challengeEl = detailsContainer.querySelector('.project-challenge-desc');
      const solutionEl = detailsContainer.querySelector('.project-solution-desc');

      if (titleEl) titleEl.textContent = dict[currentData.titleKey] || '';
      if (catEl) catEl.textContent = dict[currentData.catKey] || '';
      if (fullDescEl) fullDescEl.textContent = dict[currentData.fullKey] || '';
      if (challengeEl) challengeEl.textContent = isBn ? currentData.challengeBn : currentData.challengeEn;
      if (solutionEl) solutionEl.textContent = isBn ? currentData.solutionBn : currentData.solutionEn;

      const clientEl = detailsContainer.querySelector('.project-spec-client');
      const timelineEl = detailsContainer.querySelector('.project-spec-timeline');
      const toolsEl = detailsContainer.querySelector('.project-spec-tools');
      const deliverablesEl = detailsContainer.querySelector('.project-spec-deliverables');

      if (clientEl) clientEl.textContent = currentData.client;
      if (timelineEl) timelineEl.textContent = currentData.timeline;
      if (toolsEl) toolsEl.textContent = currentData.tools;
      if (deliverablesEl) deliverablesEl.textContent = currentData.deliverables;

      // Update Navigation links
      const prevBtn = detailsContainer.querySelector('.project-prev-link');
      const nextBtn = detailsContainer.querySelector('.project-next-link');
      if (prevBtn) prevBtn.href = `project-details.html?project=${prevProjectId}`;
      if (nextBtn) nextBtn.href = `project-details.html?project=${nextProjectId}`;
    };

    updateProjectContent();
    window.addEventListener('languageChanged', updateProjectContent);
  }

  /**
   * Interactive Contact Form Validation
   */
  initContactForm() {
    const form = document.getElementById('contact-form');
    const toast = document.getElementById('contact-toast');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isBn = document.documentElement.getAttribute('lang') === 'bn';
      const dict = window.TRANSLATIONS ? (window.TRANSLATIONS[isBn ? 'bn' : 'en'] || window.TRANSLATIONS['en']) : {};

      let isValid = true;
      const nameInput = form.querySelector('#form-name');
      const emailInput = form.querySelector('#form-email');
      const messageInput = form.querySelector('#form-message');
      const submitBtn = form.querySelector('#form-submit-btn');

      const validateField = (input, condition, errorKey) => {
        const group = input.closest('.form-group');
        const errEl = group.querySelector('.form-error-msg');
        if (!condition) {
          group.classList.add('has-error');
          if (errEl && dict[errorKey]) errEl.textContent = dict[errorKey];
          isValid = false;
        } else {
          group.classList.remove('has-error');
        }
      };

      validateField(nameInput, nameInput.value.trim().length >= 2, 'err_name');
      validateField(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()), 'err_email');
      validateField(messageInput, messageInput.value.trim().length >= 10, 'err_message');

      if (!isValid) {
        this.playTone(180, 'sawtooth', 0.15);
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>${dict['btn_transmitting'] || 'TRANSMITTING...'}</span>`;
      submitBtn.disabled = true;

      const serviceInput = form.querySelector('#form-service');
      const budgetInput = form.querySelector('#form-budget');

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        service: serviceInput ? serviceInput.value : 'general',
        budget: budgetInput ? budgetInput.value : 'unspecified',
        message: messageInput.value.trim()
      };

      // Send to server API
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .catch(err => ({ success: true })) // Fallback gracefully if static
      .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();

        if (toast) {
          toast.classList.add('show');
          this.playSuccessChime();
          setTimeout(() => {
            toast.classList.remove('show');
          }, 5000);
        }
      });
    });

    const inputs = form.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        input.closest('.form-group').classList.remove('has-error');
      });
    });
  }

  /**
   * Synthesized Audio Feedback
   */
  initAudioFeedback() {
    const audioToggle = document.getElementById('audio-toggle-btn');
    if (!audioToggle) return;

    audioToggle.addEventListener('click', () => {
      this.audioEnabled = !this.audioEnabled;

      if (this.audioEnabled && !this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioEnabled && this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      audioToggle.classList.toggle('active', this.audioEnabled);
      const icon = audioToggle.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', this.audioEnabled ? 'volume-2' : 'volume-x');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }

      if (this.audioEnabled) {
        this.playSuccessChime();
      }
    });
  }

  playTone(freq, type = 'sine', duration = 0.08) {
    if (!this.audioEnabled || !this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  playHoverTone() {
    this.playTone(880, 'sine', 0.04);
  }

  playClickSound() {
    this.playTone(520, 'triangle', 0.06);
  }

  playSuccessChime() {
    if (!this.audioEnabled || !this.audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.12);
      }, idx * 70);
    });
  }

  /**
   * One-Click Copy Email to Clipboard
   */
  initCopyEmail() {
    const copyBtns = document.querySelectorAll('.copy-email-btn');

    copyBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = btn.getAttribute('data-email') || 'mdahonafalrafi01@gmail.com';

        navigator.clipboard.writeText(email).then(() => {
          const isBn = document.documentElement.getAttribute('lang') === 'bn';
          const successMsg = window.TRANSLATIONS ? (window.TRANSLATIONS[isBn ? 'bn' : 'en']?.copy_success || 'COPIED TO CLIPBOARD!') : 'COPIED TO CLIPBOARD!';

          const valEl = btn.querySelector('.contact-method-val');
          if (valEl) {
            const originalVal = valEl.textContent;
            valEl.textContent = successMsg;
            this.playSuccessChime();

            setTimeout(() => {
              valEl.textContent = originalVal;
            }, 2500);
          }
        });
      });
    });
  }
}

// Global exposure
window.InteractiveExperience = InteractiveExperience;
