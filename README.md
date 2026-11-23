# Ultra-Premium Cinematic 3D Personal Portfolio Website

An award-winning, bilingual personal portfolio experience engineered with **Three.js**, **GSAP ScrollTrigger**, **Lenis Smooth Scroll**, and **Vanilla JavaScript**. Features an ultra-luxurious **Default Light Theme** (`#FFFFFF`, `#F8F9FC`, Deep Charcoal `#171923`, Electric Blue `#4565F5`, Soft Violet `#8265E8`, and subtle chrome metallics), an **Optional Dark Mode Toggle**, **Full Bangla & English Language Support** with Google Font **Hind Siliguri**, and a **Strictly Multi-Page Architecture** consisting of 7 distinct HTML pages.

---

## ✦ Table of Contents

- [Visual Identity & Design System](#-visual-identity--design-system)
- [Bilingual Architecture & Bangla Typography](#-bilingual-architecture--bangla-typography)
- [Multi-Page Website Structure](#-multi-page-website-structure)
- [Key Features](#-key-features)
- [Project Architecture & File Tree](#-project-architecture--file-tree)
- [Technology Stack](#-technology-stack)
- [Local Setup & Development](#-local-setup--development)
- [Customization Guide](#-customization-guide)
  - [Updating Translations (Bangla & English)](#1-updating-translations-bangla--english)
  - [Personal Details & Branding](#2-personal-details--branding)
  - [Portfolio Projects & Case Studies](#3-portfolio-projects--case-studies)
  - [Connecting the Contact Form](#4-connecting-the-contact-form)
- [Deployment Guide](#-deployment-guide)
  - [Deploying to Netlify](#deploying-to-netlify-recommended)
  - [Deploying to Vercel](#deploying-to-vercel)
  - [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Performance & Accessibility Standards](#-performance--accessibility-standards)
- [License](#-license)

---

## ✦ Visual Identity & Design System

The portfolio embodies three distinct creative and technical disciplines:

1. **Default Premium Light Theme**:
   - **Primary Background**: Pure White (`#FFFFFF`)
   - **Secondary Background**: Soft Off-White (`#F8F9FC`)
   - **Alternative Background**: Light Gray (`#F1F3F7`)
   - **Primary Typography**: Deep Charcoal (`#171923`)
   - **Secondary Typography**: Muted Gray (`#737783`)
   - **Signature Accents**: Electric Blue (`#4565F5`), Soft Violet (`#8265E8`), and Subtle Chrome Metallics
   - **Glassmorphism**: 20px blur with `rgba(255, 255, 255, 0.75)` and soft neutral borders
   - **Dark Mode**: Persisted via `localStorage` and toggled with the Moon/Sun navbar icon (`data-theme="dark"`).

2. **Cinematic Kinetic Motion**:
   - Oversized display typography with character-by-character clip-path reveals.
   - Mouse-responsive 3D character tilt on hover with GPU acceleration.
   - Infinite kinetic marquee ticker and GSAP ScrollTrigger timeline choreography.

3. **Interactive 3D Metallic Experience**:
   - Interactive Three.js scene featuring floating chrome spheres, faceted torus knot sculpture, and particle cosmos.
   - Adaptive Three.js studio lighting: updates key light, fill light, rim light, and scene fog instantly upon toggling Light/Dark theme without reloading the page.

---

## ✦ Bilingual Architecture & Bangla Typography

### Dual Language Support (বাংলা & English)
- **Instant Language Switching**: Toggle between **English** and **বাংলা** from the navigation bar.
- **Persistent State**: The user's selection is stored in `localStorage` under `'portfolio_lang'`.
- **Complete Coverage**: Navigation labels, headings, body copy, skills, services, portfolio case studies, forms, placeholders, error alerts, and metadata are 100% translated.
- **Natural, Professional Translations**: Handcrafted, natural Bangla translations representing creative post-production and technology terminology.

### Dynamic Typography Rules:
- **Bangla Font**: **Hind Siliguri** (Google Fonts weights 300, 400, 500, 600, 700). Applied automatically when `<html lang="bn">`.
  - Body & Headings: `font-family: 'Hind Siliguri', sans-serif;`
  - Proper Bangla `line-height: 1.7`–`1.82` ensuring complete glyph rendering without clipped diacritics (matras).
- **English Fonts**:
  - Display: **Syne** (Weights 700, 800)
  - Primary / Headings: **Space Grotesk** (Weights 500, 600, 700)
  - Body: **Inter** (Weights 400, 500)

```css
/* Automatic Language-Dependent Font Hierarchy */
html[lang="bn"] body,
html[lang="bn"] button,
html[lang="bn"] input,
html[lang="bn"] textarea,
html[lang="bn"] select {
  font-family: "Hind Siliguri", -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0;
  line-height: 1.75;
}

html[lang="en"] body {
  font-family: var(--font-body);
}
```

---

## ✦ Multi-Page Website Structure

The site is built with 7 independent, fully functional HTML pages:

1. **`index.html` (Home Page)**:
   - Fullscreen cinematic hero experience with Three.js 3D canvas and live Dhaka clock (`UTC+6`).
   - Kinetic marquee headline ticker.
   - Featured projects grid with case study links.
   - Featured services preview.
   - Editorial biography teaser and contact CTA banner.

2. **`about.html` (About Page)**:
   - Deep editorial narrative: Biography, Creative Philosophy, and Design Vision.
   - 3 Core Pillars: Cinematic Velocity, Generative Frontiers, and Engineering Precision.
   - Verified performance metrics strip (Watch Hours, Views, Commercial ROI).
   - 4-Phase Creative Odyssey Timeline with scroll-activated lighting progress bar.

3. **`skills.html` (Skills Page)**:
   - 9 comprehensive competency cards across Video Editing, Generative AI, and Web Development.
   - Interactive category filter tabs (*All, Video & Cinema, AI & Generative, Web & Code*).
   - Specific software breakdowns (Premiere Pro, DaVinci Resolve, CapCut Pro, Runway Gen-3, Midjourney v6, ElevenLabs, Three.js, GSAP, HTML5/CSS3).

4. **`services.html` (Services Page)**:
   - Detailed breakdown of all 5 creative service offerings.
   - Deliverable tag chips for every service.
   - 4-Step Production Pipeline (*01 Discovery & Strategy, 02 Storyboard & Assembly, 03 Cinema Polish & VFX, 04 Optimization & Delivery*).
   - Direct inquiry buttons for each service.

5. **`portfolio.html` (Portfolio Archive Page)**:
   - Complete project gallery with all 6 productions.
   - Category filter tabs (*All, AI Films, Cinematic Edits, Short-Form / Reels, Creative Web*).
   - High-resolution thumbnails, category badges, tools used, and direct case study links.

6. **`project-details.html` (Dynamic Case Study Page)**:
   - Deep dive case study template reading `?project=project-X` from the URL.
   - 16:9 cinema media showcase.
   - Narrative Executive Summary, The Challenge, and The Creative Solution.
   - Metadata sidebar: Client/Campaign, Production Timeline, Core Toolkit, and Deliverables.
   - Seamless Previous / Next project pagination links.

7. **`contact.html` (Contact Page)**:
   - Kinetic typography header.
   - Direct WhatsApp action card (`https://wa.me/8801700000000`).
   - One-click copy email button with interactive sound feedback (`tanvir.creative@gmail.com`).
   - Local Dhaka timezone badge (`UTC+6`).
   - Form with client-side validation, error handling in both languages, and toast feedback.

---

## ✦ Key Features

- **Dual-Theme Studio Engine**: Switches between Default Light Theme and Dark Mode with smooth CSS transitions and real-time Three.js lighting adaptation.
- **Zero-Dependency Split-Text Engine**: Custom character-by-character and word-by-word typography split engine supporting line breaks and 3D hover tilt without third-party paid plugins.
- **Web Audio API Sound Engine**: Synthesized micro-interaction sounds (clicks, hover tones, and success chimes) generated mathematically via oscillator nodes without external audio files.
- **Back-to-Top Button with Circular SVG Scroll Progress Ring**: Real-time calculated circular SVG stroke indicator tracking scroll depth.
- **Mobile Menu**: Fullscreen overlay menu with number badges, language selector, theme toggle, and smooth spring animations.

---

## ✦ Project Architecture & File Tree

```
portfolio/
│
├── index.html                  # Home Page (Hero, 3D Canvas, Featured Work)
├── about.html                  # About Page (Bio, Pillars, Creative Journey Timeline)
├── skills.html                 # Skills Page (Filter Tabs, 9 Skill Cards)
├── services.html               # Services Page (5 Services, 4-Step Production Pipeline)
├── portfolio.html              # Portfolio Page (Gallery, Filters, Case Study Links)
├── project-details.html        # Dynamic Case Study Template (?project=project-X)
├── contact.html                # Contact Page (Form, WhatsApp, Email Copy)
├── server.js                   # Lightweight Node.js local preview server
├── README.md                   # Complete architectural documentation
│
├── css/
│   ├── global.css              # Design tokens (Colors, Shadows, Glass, Radii)
│   ├── typography.css          # Google Fonts (Hind Siliguri, Syne, Space Grotesk, Inter)
│   ├── light-theme.css         # Default Light Theme luxury elevations & surfaces
│   ├── dark-theme.css          # Optional Dark Theme surface overrides & glows
│   ├── animations.css          # Keyframes, shimmers, floating physics, reduced-motion
│   ├── style.css               # Navbar, cards, buttons, timeline, forms, footer
│   └── responsive.css          # Breakpoints (1280px, 1024px, 768px, 480px)
│
├── js/
│   ├── translations.js         # Centralized bilingual dictionary (en & bn)
│   ├── language.js             # Language switcher & localStorage persistence
│   ├── theme.js                # Theme switcher (Light default / Dark) & persistence
│   ├── navigation.js           # Active links, scroll detector, mobile menu, live clock
│   ├── three-scene.js          # Three.js 3D canvas, studio lighting, theme sync
│   ├── typography.js           # Custom split-text engine, 3D hover tilt, marquee
│   ├── animations.js           # GSAP ScrollTrigger timeline choreography
│   ├── interactions.js         # Cursor, magnetic physics, project loader, form validation
│   └── main.js                 # Master coordinator & Lenis smooth scroll
│
└── assets/
    └── images/                 # High-resolution media assets
        ├── profile.jpg         # Hero section portrait
        ├── about.jpg           # About section editorial photo
        ├── project-1.jpg       # Cyberpunk 2099 AI Spec Film
        ├── project-2.jpg       # The Rise of Artificial Minds Documentary
        ├── project-3.jpg       # Velocity Hyperdrive Viral Series
        ├── project-4.jpg       # Chronos Aether WebGL Experience
        ├── project-5.jpg       # Zenith Automotive Commercial
        └── project-6.jpg       # Future Formula Reels Campaign
```

---

## ✦ Technology Stack

| Layer | Library / Standard | Purpose |
| :--- | :--- | :--- |
| **Markup & Layout** | HTML5 / CSS3 | Semantic markup, CSS custom properties, Grid, Flexbox, glassmorphic filters |
| **Typography** | Hind Siliguri, Syne, Space Grotesk, Inter | Google Fonts typography hierarchy with automatic language switching |
| **3D Rendering** | Three.js (CDN) | Dual-theme studio lighting, metallic chrome shaders, floating spheres |
| **Animation Engine** | GSAP 3.12+ & ScrollTrigger | Page timeline choreography, split-text reveals, scroll scrubbing |
| **Smooth Scrolling** | @studio-freight/lenis | Momentum scrolling with full touch fallback |
| **Icons** | Lucide Icons (CDN) | Minimalist SVG vector icons |
| **Sound Synthesis** | Web Audio API | Zero-dependency mathematical audio oscillators |

---

## ✦ Local Setup & Development

### Option A: Using the Built-in Node.js Preview Server (Recommended)

1. Make sure Node.js is installed.
2. In the project directory, run:
   ```bash
   node server.js
   ```
3. Open your browser to:
   ```
   http://localhost:3000
   ```

### Option B: Using VS Code Live Server
1. Open the project folder in VS Code.
2. Right-click `index.html` and click **"Open with Live Server"**.

### Option C: Using Python Simple HTTP Server
```bash
python -m http.server 3000
```

---

## ✦ Customization Guide

### 1. Updating Translations (Bangla & English)
All website text is organized in `js/translations.js`. To update any headline, description, or button label, update both the `en` and `bn` objects:

```javascript
// js/translations.js
window.TRANSLATIONS = {
  en: {
    hero_name: "TANVIR HASAN",
    hero_role: "Video Editor | AI Content Creator | Creative Developer",
    // Add or edit strings here
  },
  bn: {
    hero_name: "তানভীর হাসান",
    hero_role: "ভিডিও এডিটর | এআই কন্টেন্ট ক্রিয়েটর | ক্রিয়েটিভ ডেভেলপার",
    // Corresponding natural Bangla translations
  }
};
```

### 2. Personal Details & Branding
- **Name & Title**: Edit `js/translations.js` (`hero_name`, `hero_role`) and the `<title>` tags across all 7 HTML files.
- **Images**: Replace `assets/images/profile.jpg` and `assets/images/about.jpg` with your own high-resolution editorial photography (maintain 4:5 or 1:1 aspect ratios).
- **Favicon**: Change the inline SVG favicon in the `<head>` of each HTML file.

### 3. Portfolio Projects & Case Studies
- Replace images in `assets/images/project-1.jpg` through `project-6.jpg` (16:9 aspect ratio recommended).
- Detailed case study information (Client, Timeline, Tools, Deliverables, Challenge, and Solution) is configured in `js/interactions.js` inside the `projectData` object.

### 4. Connecting the Contact Form
To connect `contact.html` to an active email service:
- **Formspree**: Replace `<form id="contact-form">` action with `https://formspree.io/f/YOUR_FORM_ID`.
- **EmailJS / Web3Forms**: Add their script tag to `contact.html` and trigger the send function inside `initContactForm()` in `js/interactions.js`.

---

## ✦ Deployment Guide

### Deploying to Netlify (Recommended)
1. Push your repository to GitHub or drag-and-drop the project folder to the Netlify Drop dashboard.
2. Build Settings:
   - **Base directory**: `.`
   - **Publish directory**: `.`
   - **Build command**: *(leave empty)*
3. Click **Deploy Site**.

### Deploying to Vercel
1. Install the Vercel CLI (`npm i -g vercel`) or import the GitHub repo in the Vercel Dashboard.
2. Framework Preset: **Other**.
3. Output Directory: `./`.
4. Click **Deploy**.

### Deploying to GitHub Pages
1. Go to repository **Settings** → **Pages**.
2. Under **Build and deployment**, select:
   - Source: **Deploy from a branch**
   - Branch: `main` / `root`
3. Click **Save**.

---

## ✦ Performance & Accessibility Standards

- **Lighthouse Targets**: 95+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO.
- **WCAG 2.1 AA Compliance**: High-contrast text ratios for both Light Mode and Dark Mode.
- **Respects Motion Preferences**: Detects `prefers-reduced-motion` and disables heavy animations and continuous rotation.
- **Optimized Mobile Layout**: Touch events automatically disable cursor canvas and heavy mouse tilt effects to save battery and maintain 60 FPS.

---

## ✦ License

This project is licensed under the **MIT License**. You are free to use, customize, and build upon this architecture for personal or commercial portfolio websites.
