/**
 * ==========================================================================
 * THREE.JS SCENE - 3D METALLIC CHROME & INTERACTIVE ENVIRONMENT
 * Dual-Theme Aware (Default: Premium Light Theme with Silver-Chrome Reflections;
 * Optional: Deep Obsidian Dark Mode).
 * ==========================================================================
 */

class Metallic3DScene {
  constructor(containerId = 'hero-canvas-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Mouse & Window Tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.isMobile = window.innerWidth < 768;
    this.isPaused = false;
    this.clock = new THREE.Clock();

    // Scene Elements
    this.floatingSpheres = [];
    this.sculptureGroup = null;
    this.particles = null;

    this.init();
  }

  init() {
    if (!this.checkWebGL()) {
      this.container.classList.add('webgl-fallback');
      return;
    }

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.updateFog();

    // 2. Camera Setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.0 : 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    const oldCanvas = this.container.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();
    this.renderer.domElement.id = 'hero-canvas';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.setupLighting();

    // 5. 3D Elements
    this.createCentralSculpture();
    this.createFloatingChromeSpheres();
    this.createParticleCosmos();

    // 6. Event Bindings
    this.bindEvents();

    // 7. Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // 8. IntersectionObserver: pause rendering when hero is off-screen
    if ('IntersectionObserver' in window) {
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isPaused = !entry.isIntersecting;
          if (entry.isIntersecting) {
            this.clock.start();
            requestAnimationFrame(this.animate);
          }
        });
      }, { threshold: 0.05 });
      this._observer.observe(this.container);
    }
  }

  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  get isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  updateFog() {
    if (this.isDarkTheme) {
      this.scene.fog = new THREE.FogExp2(0x050505, 0.045);
    } else {
      this.scene.fog = new THREE.FogExp2(0xf8f9fc, 0.04);
    }
  }

  setupLighting() {
    // Ambient Light
    const ambientColor = this.isDarkTheme ? 0x0c101c : 0xe2e8f0;
    this.ambientLight = new THREE.AmbientLight(ambientColor, this.isDarkTheme ? 1.2 : 1.5);
    this.scene.add(this.ambientLight);

    // Key Light: Electric Blue
    const keyColor = this.isDarkTheme ? 0x00f0ff : 0x4565f5;
    this.keyLight = new THREE.DirectionalLight(keyColor, 2.8);
    this.keyLight.position.set(6, 6, 5);
    this.scene.add(this.keyLight);

    // Fill Light: Soft Violet
    const fillColor = this.isDarkTheme ? 0x8b5cf6 : 0x8265e8;
    this.fillLight = new THREE.DirectionalLight(fillColor, 2.2);
    this.fillLight.position.set(-6, -4, 3);
    this.scene.add(this.fillLight);

    // Rim Light: Pure White Specular
    this.rimLight = new THREE.PointLight(0xffffff, 3.0, 20);
    this.rimLight.position.set(0, 5, 4);
    this.scene.add(this.rimLight);

    // Dynamic Cursor Tracking Light
    this.accentLight = new THREE.PointLight(keyColor, 1.8, 15);
    this.accentLight.position.set(0, 0, 3);
    this.scene.add(this.accentLight);
  }

  updateThemeColors() {
    this.updateFog();
    const isDark = this.isDarkTheme;

    if (this.ambientLight) {
      this.ambientLight.color.setHex(isDark ? 0x0c101c : 0xe2e8f0);
      this.ambientLight.intensity = isDark ? 1.2 : 1.5;
    }
    if (this.keyLight) {
      this.keyLight.color.setHex(isDark ? 0x00f0ff : 0x4565f5);
    }
    if (this.fillLight) {
      this.fillLight.color.setHex(isDark ? 0x8b5cf6 : 0x8265e8);
    }
    if (this.accentLight) {
      this.accentLight.color.setHex(isDark ? 0x00f0ff : 0x4565f5);
    }
    if (this.knotMesh) {
      this.knotMesh.material.color.setHex(isDark ? 0xf1f5f9 : 0xffffff);
      this.knotMesh.material.metalness = isDark ? 0.96 : 0.98;
      this.knotMesh.material.roughness = isDark ? 0.12 : 0.14;
    }
  }

  createChromeMaterial(tintColor = 0xffffff, roughness = 0.14, metalness = 0.98) {
    return new THREE.MeshStandardMaterial({
      color: tintColor,
      metalness: metalness,
      roughness: roughness,
      wireframe: false
    });
  }

  createCentralSculpture() {
    this.sculptureGroup = new THREE.Group();

    // Metallic Torus Knot Sculpture
    const knotGeometry = this.isMobile
      ? new THREE.TorusKnotGeometry(1.3, 0.4, 64, 16, 2, 3)
      : new THREE.TorusKnotGeometry(1.45, 0.42, 128, 32, 2, 3);

    const knotMaterial = this.createChromeMaterial(0xffffff, 0.14, 0.98);
    this.knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    this.knotMesh.castShadow = true;
    this.sculptureGroup.add(this.knotMesh);

    // Orbit Rings
    const ringGeo = new THREE.RingGeometry(2.4, 2.44, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4565f5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    this.orbitRing1 = new THREE.Mesh(ringGeo, ringMat);
    this.orbitRing1.rotation.x = Math.PI / 3;
    this.sculptureGroup.add(this.orbitRing1);

    const ringGeo2 = new THREE.RingGeometry(2.7, 2.73, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8265e8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    this.orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.orbitRing2.rotation.y = Math.PI / 4;
    this.sculptureGroup.add(this.orbitRing2);

    if (!this.isMobile && window.innerWidth > 1024) {
      this.sculptureGroup.position.set(1.5, 0.2, 0);
    } else {
      this.sculptureGroup.position.set(0, 0, -1);
      this.sculptureGroup.scale.set(0.75, 0.75, 0.75);
    }

    this.scene.add(this.sculptureGroup);
  }

  createFloatingChromeSpheres() {
    const sphereCount = this.isMobile ? 5 : 10;
    const sphereMaterial = this.createChromeMaterial(0xffffff, 0.1, 0.99);

    for (let i = 0; i < sphereCount; i++) {
      const radius = 0.15 + Math.random() * 0.35;
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphere = new THREE.Mesh(sphereGeo, sphereMaterial);

      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 6;
      const z = -2 + Math.random() * 4;

      sphere.position.set(x, y, z);

      sphere.userData = {
        initialX: x,
        initialY: y,
        initialZ: z,
        speedX: 0.2 + Math.random() * 0.4,
        speedY: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.3 + Math.random() * 0.4
      };

      this.floatingSpheres.push(sphere);
      this.scene.add(sphere);
    }
  }

  createParticleCosmos() {
    const particleCount = this.isMobile ? 120 : 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorBlue = new THREE.Color(0x4565f5);
    const colorViolet = new THREE.Color(0x8265e8);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      let chosenColor = colorWhite;
      const rand = Math.random();
      if (rand < 0.45) chosenColor = colorBlue;
      else if (rand < 0.75) chosenColor = colorViolet;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleTexture = this.generateParticleTexture();

    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.35, 'rgba(69, 101, 245, 0.7)');
    gradient.addColorStop(0.7, 'rgba(130, 101, 232, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX - this.windowHalfX) / this.windowHalfX;
      this.mouse.targetY = (e.clientY - this.windowHalfY) / this.windowHalfY;
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!this.container) return;
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      this.isMobile = window.innerWidth < 768;

      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.0 : 1.5));

      if (this.sculptureGroup) {
        if (!this.isMobile && window.innerWidth > 1024) {
          this.sculptureGroup.position.set(1.5, 0.2, 0);
          this.sculptureGroup.scale.set(1, 1, 1);
        } else {
          this.sculptureGroup.position.set(0, 0, -1);
          this.sculptureGroup.scale.set(0.75, 0.75, 0.75);
        }
      }
    });

    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused) {
        this.clock.start();
        requestAnimationFrame(this.animate);
      }
    });

    // Theme changed listener
    window.addEventListener('themeChanged', () => {
      this.updateThemeColors();
    });
  }

  animate() {
    if (this.isPaused) return;

    requestAnimationFrame(this.animate);

    const elapsedTime = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (this.sculptureGroup) {
      this.knotMesh.rotation.x = elapsedTime * 0.22 + this.mouse.y * 0.3;
      this.knotMesh.rotation.y = elapsedTime * 0.32 + this.mouse.x * 0.4;

      this.orbitRing1.rotation.z = elapsedTime * 0.15;
      this.orbitRing2.rotation.z = -elapsedTime * 0.2;

      const breath = 1 + Math.sin(elapsedTime * 1.5) * 0.02;
      const baseScale = (!this.isMobile && window.innerWidth > 1024) ? 1 : 0.75;
      this.sculptureGroup.scale.set(baseScale * breath, baseScale * breath, baseScale * breath);
    }

    this.floatingSpheres.forEach((sphere) => {
      const { initialX, initialY, initialZ, speedX, speedY, phase, amplitude } = sphere.userData;
      sphere.position.y = initialY + Math.sin(elapsedTime * speedY + phase) * amplitude;
      sphere.position.x = initialX + Math.cos(elapsedTime * speedX + phase) * (amplitude * 0.6);
      sphere.position.z = initialZ + Math.sin(elapsedTime * 0.3 + phase) * 0.2;

      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.015;
    });

    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.03 + this.mouse.x * 0.05;
      this.particles.rotation.x = elapsedTime * 0.015 + this.mouse.y * 0.05;
    }

    if (this.accentLight) {
      this.accentLight.position.x = this.mouse.x * 4;
      this.accentLight.position.y = -this.mouse.y * 3;
    }

    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.04;
    this.camera.position.y += (-this.mouse.y * 0.4 - this.camera.position.y) * 0.04;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}

// Global exposure
window.Metallic3DScene = Metallic3DScene;
