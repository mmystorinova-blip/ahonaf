/**
 * ==========================================================================
 * AHONAF ULTRA ADMIN PANEL - FRONTEND CONTROLLER
 * Full A-Z Management for Portfolio Data, Media, Projects, Messages & Security
 * ==========================================================================
 */

const API_BASE = '/api';
let siteData = { profile: {}, marquee: [], projects: [], services: [], skills: [] };
let messagesList = [];
let authToken = localStorage.getItem('ahonaf_admin_token') || null;

// ==========================================
// 1. INITIALIZATION & AUTHENTICATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  setupEventListeners();
  checkAuth();
});

async function apiFetch(endpoint, options = {}) {
  options.headers = options.headers || {};
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (res.status === 401 && !endpoint.includes('/login')) {
      handleUnauthorized();
      throw new Error('Unauthorized');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

async function checkAuth() {
  if (!authToken) {
    showLoginScreen();
    return;
  }

  try {
    const data = await apiFetch('/auth/check');
    if (data.authenticated) {
      showAdminApp(data.username);
      loadAllData();
    } else {
      showLoginScreen();
    }
  } catch (e) {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-app').style.display = 'none';
  authToken = null;
  localStorage.removeItem('ahonaf_admin_token');
}

function showAdminApp(username = 'Admin') {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
  document.getElementById('sidebar-admin-name').textContent = username;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleUnauthorized() {
  showLoginScreen();
  showToast('Session expired. Please log in again.', 'error');
}

// ==========================================
// 2. EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Login Form
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorBox = document.getElementById('login-error');

    errorBox.style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        authToken = data.token;
        localStorage.setItem('ahonaf_admin_token', authToken);
        showAdminApp(data.username);
        loadAllData();
        showToast('Welcome back, Admin!', 'success');
      } else {
        document.getElementById('login-error-text').textContent = data.error || 'Invalid credentials.';
        errorBox.style.display = 'block';
      }
    } catch (err) {
      document.getElementById('login-error-text').textContent = 'Network or server error.';
      errorBox.style.display = 'block';
    }
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (e) {}
    showLoginScreen();
    showToast('Logged out safely.', 'success');
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('admin-sidebar');
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar on click outside (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    }
  });

  // Tab Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      switchTab(tabName);
      if (window.innerWidth <= 992) sidebar.classList.remove('open');
    });
  });

  // Quick Save Header button
  document.getElementById('btn-quick-save').addEventListener('click', () => {
    showToast('All changes are published live immediately!', 'success');
  });

  // Profile Form Submit
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProfile();
  });

  // Profile Image File Upload
  document.getElementById('profile-img-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadImage(file, (url) => {
      document.getElementById('profile-img-preview').src = `../${url}`;
      document.getElementById('profile-img-path').value = url;
      showToast('Profile image uploaded! Click Save to apply.', 'success');
    });
  });

  // Project Image File Upload
  document.getElementById('proj-image-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadImage(file, (url) => {
      document.getElementById('proj-image').value = url;
      showToast('Thumbnail uploaded!', 'success');
    });
  });

  // Password Change Form
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await changePassword();
  });
}

// ==========================================
// 3. TAB SWITCHING
// ==========================================
function switchTab(tabId) {
  document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabId}`);
  const targetNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);

  if (targetTab) targetTab.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  const titles = {
    dashboard: 'Dashboard Overview',
    profile: 'Profile, Hero & Social Channels',
    projects: 'Projects & Case Studies',
    services: 'Production Services',
    skills: 'Skills & Software Stack',
    marquee: 'Marquee Ticker Slogans',
    messages: 'Client Inquiries Inbox',
    security: 'Security & Backup Control'
  };

  document.getElementById('topbar-section-title').textContent = titles[tabId] || 'Admin Panel';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 4. LOAD & POPULATE DATA
// ==========================================
async function loadAllData() {
  try {
    const [data, messages] = await Promise.all([
      apiFetch('/site-data'),
      apiFetch('/admin/messages')
    ]);

    siteData = data || {};
    messagesList = messages || [];

    updateDashboardStats();
    populateProfileForm();
    renderProjectsTable();
    renderServicesTable();
    renderSkillsTable();
    renderMarqueeList();
    renderMessagesTable();

    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    showToast('Failed to load portfolio data.', 'error');
  }
}

function updateDashboardStats() {
  const pCount = (siteData.projects || []).length;
  const sCount = (siteData.services || []).length;
  const kCount = (siteData.skills || []).length;
  const mCount = (messagesList || []).length;
  const unreadCount = (messagesList || []).filter(m => !m.read).length;

  document.getElementById('stat-projects-count').textContent = pCount;
  document.getElementById('sidebar-projects-count').textContent = pCount;
  document.getElementById('stat-services-count').textContent = sCount;
  document.getElementById('stat-skills-count').textContent = kCount;
  document.getElementById('stat-messages-count').textContent = mCount;

  const unreadBadge = document.getElementById('sidebar-unread-count');
  if (unreadCount > 0) {
    unreadBadge.textContent = unreadCount;
    unreadBadge.style.display = 'inline-block';
  } else {
    unreadBadge.style.display = 'none';
  }

  // Populate Dashboard recent messages
  const recentTable = document.getElementById('dashboard-recent-messages');
  if (!messagesList.length) {
    recentTable.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No inquiries yet. Submissions from contact.html will show here.</td></tr>`;
    return;
  }

  recentTable.innerHTML = messagesList.slice(0, 5).map(m => `
    <tr class="${m.read ? '' : 'unread-row'}">
      <td><span class="badge ${m.read ? 'badge-green' : 'badge-cyan'}">${m.read ? 'READ' : 'NEW'}</span></td>
      <td>${formatDate(m.date)}</td>
      <td><strong>${escapeHTML(m.name)}</strong></td>
      <td><a href="mailto:${escapeHTML(m.email)}" style="color: var(--accent-cyan); text-decoration: none;">${escapeHTML(m.email)}</a></td>
      <td>${escapeHTML(m.service || 'General')}</td>
      <td>${escapeHTML(m.budget || '-')}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="switchTab('messages')">View</button>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// 5. PROFILE & HERO TAB
// ==========================================
function populateProfileForm() {
  const p = siteData.profile || {};
  document.getElementById('profile-name').value = p.name || '';
  document.getElementById('profile-short-name').value = p.shortName || '';
  document.getElementById('profile-role').value = p.role || '';
  document.getElementById('profile-role-bn').value = p.roleBn || '';
  document.getElementById('hero-title-1').value = p.heroTitleLine1 || '';
  document.getElementById('hero-title-1-bn').value = p.heroTitleLine1Bn || '';
  document.getElementById('hero-title-2').value = p.heroTitleLine2 || '';
  document.getElementById('hero-title-2-bn').value = p.heroTitleLine2Bn || '';
  document.getElementById('hero-bio').value = p.heroBio || '';
  document.getElementById('hero-bio-bn').value = p.heroBioBn || '';
  document.getElementById('profile-status').value = p.status || '';
  document.getElementById('profile-status-bn').value = p.statusBn || '';

  document.getElementById('profile-whatsapp').value = p.whatsapp || '';
  document.getElementById('profile-facebook').value = p.facebook || '';
  document.getElementById('profile-instagram').value = p.instagram || '';
  document.getElementById('profile-email').value = p.email || '';
  document.getElementById('profile-phone').value = p.phone || '';
  document.getElementById('profile-location').value = p.location || '';

  if (p.profileImage) {
    document.getElementById('profile-img-preview').src = `../${p.profileImage}`;
    document.getElementById('profile-img-path').value = p.profileImage;
  }
}

async function saveProfile() {
  const profileData = {
    name: document.getElementById('profile-name').value.trim(),
    shortName: document.getElementById('profile-short-name').value.trim(),
    role: document.getElementById('profile-role').value.trim(),
    roleBn: document.getElementById('profile-role-bn').value.trim(),
    heroTitleLine1: document.getElementById('hero-title-1').value.trim(),
    heroTitleLine1Bn: document.getElementById('hero-title-1-bn').value.trim(),
    heroTitleLine2: document.getElementById('hero-title-2').value.trim(),
    heroTitleLine2Bn: document.getElementById('hero-title-2-bn').value.trim(),
    heroBio: document.getElementById('hero-bio').value.trim(),
    heroBioBn: document.getElementById('hero-bio-bn').value.trim(),
    status: document.getElementById('profile-status').value.trim(),
    statusBn: document.getElementById('profile-status-bn').value.trim(),
    whatsapp: document.getElementById('profile-whatsapp').value.trim(),
    facebook: document.getElementById('profile-facebook').value.trim(),
    instagram: document.getElementById('profile-instagram').value.trim(),
    email: document.getElementById('profile-email').value.trim(),
    phone: document.getElementById('profile-phone').value.trim(),
    location: document.getElementById('profile-location').value.trim(),
    profileImage: document.getElementById('profile-img-path').value.trim() || 'assets/images/profile.png'
  };

  try {
    const res = await apiFetch('/admin/profile', { method: 'POST', body: profileData });
    siteData.profile = res.data;
    showToast('Profile and hero details saved live!', 'success');
  } catch (err) {
    showToast('Error saving profile.', 'error');
  }
}

// ==========================================
// 6. PROJECTS TAB
// ==========================================
function renderProjectsTable() {
  const tbody = document.getElementById('projects-table-body');
  const projects = siteData.projects || [];

  if (!projects.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No projects yet. Click "+ Add New Project" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = projects.map(p => `
    <tr>
      <td>
        <img src="../${p.image}" class="table-thumb" alt="${escapeHTML(p.title)}" onerror="this.src='../assets/images/project-1.jpg'">
      </td>
      <td>
        <strong>${escapeHTML(p.title)}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(p.titleBn || '')}</div>
      </td>
      <td><span class="badge badge-purple">${escapeHTML(p.category)}</span></td>
      <td>${escapeHTML(p.client || '-')}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${Array.isArray(p.tools) ? p.tools.join(', ') : escapeHTML(p.tools || '')}</td>
      <td>
        <span class="badge ${p.featured ? 'badge-cyan' : 'badge-green'}">
          ${p.featured ? '★ FEATURED' : 'ARCHIVE'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm" onclick="editProject('${p.id}')">
            <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">
            <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openProjectModal(project = null) {
  const modal = document.getElementById('project-modal');
  const title = document.getElementById('project-modal-title');
  const form = document.getElementById('project-form');

  form.reset();

  if (project) {
    title.textContent = 'Edit Project: ' + project.title;
    document.getElementById('proj-id').value = project.id;
    document.getElementById('proj-title').value = project.title || '';
    document.getElementById('proj-title-bn').value = project.titleBn || '';
    document.getElementById('proj-category').value = project.category || '';
    document.getElementById('proj-category-bn').value = project.categoryBn || '';
    document.getElementById('proj-image').value = project.image || '';
    document.getElementById('proj-client').value = project.client || '';
    document.getElementById('proj-timeline').value = project.timeline || '';
    document.getElementById('proj-tools').value = Array.isArray(project.tools) ? project.tools.join(', ') : (project.tools || '');
    document.getElementById('proj-deliverables').value = project.deliverables || '';
    document.getElementById('proj-desc').value = project.shortDesc || '';
    document.getElementById('proj-desc-bn').value = project.shortDescBn || '';
    document.getElementById('proj-challenge-en').value = project.challengeEn || '';
    document.getElementById('proj-solution-en').value = project.solutionEn || '';
    document.getElementById('proj-featured').checked = !!project.featured;
  } else {
    title.textContent = 'Add New Project';
    document.getElementById('proj-id').value = '';
    document.getElementById('proj-featured').checked = true;
  }

  modal.classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.remove('open');
}

function editProject(id) {
  const proj = (siteData.projects || []).find(p => p.id === id);
  if (proj) openProjectModal(proj);
}

async function saveProjectForm() {
  const id = document.getElementById('proj-id').value;
  const toolsRaw = document.getElementById('proj-tools').value;
  const toolsArray = toolsRaw.split(',').map(t => t.trim()).filter(Boolean);

  const projectObj = {
    id: id || undefined,
    title: document.getElementById('proj-title').value.trim(),
    titleBn: document.getElementById('proj-title-bn').value.trim(),
    category: document.getElementById('proj-category').value.trim(),
    categoryBn: document.getElementById('proj-category-bn').value.trim(),
    image: document.getElementById('proj-image').value.trim() || 'assets/images/project-1.jpg',
    client: document.getElementById('proj-client').value.trim(),
    timeline: document.getElementById('proj-timeline').value.trim(),
    tools: toolsArray,
    deliverables: document.getElementById('proj-deliverables').value.trim(),
    shortDesc: document.getElementById('proj-desc').value.trim(),
    shortDescBn: document.getElementById('proj-desc-bn').value.trim(),
    challengeEn: document.getElementById('proj-challenge-en').value.trim(),
    solutionEn: document.getElementById('proj-solution-en').value.trim(),
    featured: document.getElementById('proj-featured').checked
  };

  if (!projectObj.title || !projectObj.category) {
    showToast('Title and Category are required.', 'error');
    return;
  }

  try {
    await apiFetch('/admin/projects', { method: 'POST', body: projectObj });
    closeProjectModal();
    showToast('Project saved successfully!', 'success');
    await loadAllData();
  } catch (err) {
    showToast('Failed to save project.', 'error');
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    await apiFetch(`/admin/projects/${id}`, { method: 'DELETE' });
    showToast('Project deleted!', 'success');
    await loadAllData();
  } catch (err) {
    showToast('Error deleting project.', 'error');
  }
}

// ==========================================
// 7. SERVICES TAB
// ==========================================
function renderServicesTable() {
  const tbody = document.getElementById('services-table-body');
  const services = siteData.services || [];

  if (!services.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No services yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = services.map(s => `
    <tr>
      <td><strong>${escapeHTML(s.title)}</strong></td>
      <td>${escapeHTML(s.titleBn || '-')}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${Array.isArray(s.tools) ? s.tools.join(', ') : escapeHTML(s.tools || '')}</td>
      <td style="font-size: 0.8rem;">${escapeHTML(s.deliverable || '-')}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm" onclick="editService('${s.id}')">
            <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteService('${s.id}')">
            <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openServiceModal(service = null) {
  const modal = document.getElementById('service-modal');
  const form = document.getElementById('service-form');
  form.reset();

  if (service) {
    document.getElementById('service-modal-title').textContent = 'Edit Service';
    document.getElementById('service-id').value = service.id;
    document.getElementById('service-title').value = service.title || '';
    document.getElementById('service-title-bn').value = service.titleBn || '';
    document.getElementById('service-desc').value = service.desc || '';
    document.getElementById('service-desc-bn').value = service.descBn || '';
    document.getElementById('service-tools').value = Array.isArray(service.tools) ? service.tools.join(', ') : (service.tools || '');
    document.getElementById('service-deliverable').value = service.deliverable || '';
  } else {
    document.getElementById('service-modal-title').textContent = 'Add Service';
    document.getElementById('service-id').value = '';
  }

  modal.classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeServiceModal() {
  document.getElementById('service-modal').classList.remove('open');
}

function editService(id) {
  const s = (siteData.services || []).find(x => x.id === id);
  if (s) openServiceModal(s);
}

async function saveServiceForm() {
  const id = document.getElementById('service-id').value;
  const tools = document.getElementById('service-tools').value.split(',').map(t => t.trim()).filter(Boolean);

  const serviceObj = {
    id: id || undefined,
    title: document.getElementById('service-title').value.trim(),
    titleBn: document.getElementById('service-title-bn').value.trim(),
    desc: document.getElementById('service-desc').value.trim(),
    descBn: document.getElementById('service-desc-bn').value.trim(),
    tools,
    deliverable: document.getElementById('service-deliverable').value.trim()
  };

  if (!serviceObj.title) {
    showToast('Service title is required.', 'error');
    return;
  }

  try {
    await apiFetch('/admin/services', { method: 'POST', body: serviceObj });
    closeServiceModal();
    showToast('Service saved live!', 'success');
    await loadAllData();
  } catch (err) {
    showToast('Error saving service.', 'error');
  }
}

async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    await apiFetch(`/admin/services/${id}`, { method: 'DELETE' });
    showToast('Service deleted!', 'success');
    await loadAllData();
  } catch (err) {
    showToast('Error deleting service.', 'error');
  }
}

// ==========================================
// 8. SKILLS TAB
// ==========================================
function renderSkillsTable() {
  const tbody = document.getElementById('skills-table-body');
  const skills = siteData.skills || [];

  if (!skills.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No skills yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = skills.map((sk, index) => `
    <tr>
      <td><strong>${escapeHTML(sk.name)}</strong></td>
      <td><span class="badge badge-purple">${escapeHTML(sk.category)}</span></td>
      <td><span class="badge badge-cyan">${escapeHTML(sk.level)}</span></td>
      <td>${sk.highlight ? '<span class="badge badge-green">★ YES</span>' : '<span style="color:var(--text-dim);">No</span>'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm" onclick="editSkill(${index})">
            <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteSkill(${index})">
            <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openSkillModal(skill = null) {
  const modal = document.getElementById('skill-modal');
  const form = document.getElementById('skill-form');
  form.reset();

  if (skill) {
    document.getElementById('skill-orig-name').value = skill.name;
    document.getElementById('skill-name').value = skill.name;
    document.getElementById('skill-category').value = skill.category || 'editing';
    document.getElementById('skill-level').value = skill.level || 'Expert';
    document.getElementById('skill-highlight').checked = !!skill.highlight;
  } else {
    document.getElementById('skill-orig-name').value = '';
    document.getElementById('skill-highlight').checked = true;
  }

  modal.classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeSkillModal() {
  document.getElementById('skill-modal').classList.remove('open');
}

function editSkill(idx) {
  const sk = (siteData.skills || [])[idx];
  if (sk) openSkillModal(sk);
}

async function saveSkillForm() {
  const origName = document.getElementById('skill-orig-name').value;
  const name = document.getElementById('skill-name').value.trim();
  const category = document.getElementById('skill-category').value;
  const level = document.getElementById('skill-level').value;
  const highlight = document.getElementById('skill-highlight').checked;

  if (!name) {
    showToast('Skill name required.', 'error');
    return;
  }

  const skills = siteData.skills ? [...siteData.skills] : [];
  const newObj = { name, category, level, highlight };

  if (origName) {
    const idx = skills.findIndex(s => s.name === origName);
    if (idx !== -1) skills[idx] = newObj;
    else skills.push(newObj);
  } else {
    skills.push(newObj);
  }

  try {
    await apiFetch('/admin/skills', { method: 'POST', body: skills });
    closeSkillModal();
    showToast('Skill updated!', 'success');
    await loadAllData();
  } catch (err) {
    showToast('Failed to save skill.', 'error');
  }
}

async function deleteSkill(idx) {
  if (!confirm('Remove this skill?')) return;
  const skills = siteData.skills ? [...siteData.skills] : [];
  skills.splice(idx, 1);
  try {
    await apiFetch('/admin/skills', { method: 'POST', body: skills });
    showToast('Skill removed!', 'success');
    await loadAllData();
  } catch (e) {
    showToast('Error removing skill.', 'error');
  }
}

// ==========================================
// 9. MARQUEE TICKER TAB
// ==========================================
function renderMarqueeList() {
  const container = document.getElementById('marquee-items-list');
  const items = siteData.marquee || [];

  if (!items.length) {
    container.innerHTML = `<p style="color: var(--text-muted);">No marquee items configured.</p>`;
    return;
  }

  container.innerHTML = items.map((item, idx) => `
    <div style="display: flex; gap: 0.75rem; align-items: center; background: #0E1322; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
      <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan);">#0${idx + 1}</span>
      <input type="text" class="form-input marquee-input-en" data-idx="${idx}" value="${escapeHTML(item.en || '')}" placeholder="English Slogan" style="flex: 1;">
      <input type="text" class="form-input marquee-input-bn" data-idx="${idx}" value="${escapeHTML(item.bn || '')}" placeholder="বাংলা স্লোগান" style="flex: 1;">
      <button class="btn btn-danger btn-sm" onclick="removeMarqueeItem(${idx})">
        <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
      </button>
    </div>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addMarqueeItem() {
  siteData.marquee = siteData.marquee || [];
  siteData.marquee.push({ en: 'NEW PRODUCTION TITLE', bn: 'নতুন প্রোডাকশন শিরোনাম' });
  renderMarqueeList();
}

function removeMarqueeItem(idx) {
  siteData.marquee.splice(idx, 1);
  renderMarqueeList();
}

async function saveMarqueeSettings() {
  const enInputs = document.querySelectorAll('.marquee-input-en');
  const bnInputs = document.querySelectorAll('.marquee-input-bn');
  const newMarquee = [];

  enInputs.forEach((inp, idx) => {
    const enVal = inp.value.trim();
    const bnVal = (bnInputs[idx] ? bnInputs[idx].value.trim() : enVal);
    if (enVal) {
      newMarquee.push({ en: enVal, bn: bnVal });
    }
  });

  try {
    await apiFetch('/admin/marquee', { method: 'POST', body: { marquee: newMarquee } });
    showToast('Marquee ticker updated live on Home page!', 'success');
    await loadAllData();
  } catch (err) {
    showToast('Error saving marquee.', 'error');
  }
}

// ==========================================
// 10. MESSAGES INBOX TAB
// ==========================================
function renderMessagesTable(filter = 'all') {
  const tbody = document.getElementById('messages-table-body');
  let list = messagesList || [];

  if (filter === 'unread') {
    list = list.filter(m => !m.read);
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No messages found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(m => `
    <tr class="${m.read ? '' : 'unread-row'}">
      <td><span class="badge ${m.read ? 'badge-green' : 'badge-cyan'}">${m.read ? 'READ' : 'NEW'}</span></td>
      <td style="font-size: 0.8rem; white-space: nowrap;">${formatDate(m.date)}</td>
      <td><strong>${escapeHTML(m.name)}</strong></td>
      <td>
        <a href="mailto:${escapeHTML(m.email)}?subject=Inquiry Response - Ahonaf" style="color: var(--accent-cyan); text-decoration: none;">
          ${escapeHTML(m.email)}
        </a>
      </td>
      <td><span class="badge badge-purple">${escapeHTML(m.service || 'General')}</span></td>
      <td>${escapeHTML(m.budget || '-')}</td>
      <td style="max-width: 300px; font-size: 0.84rem; line-height: 1.4;">
        ${escapeHTML(m.message)}
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm" title="Toggle Read Status" onclick="toggleMessageRead('${m.id}')">
            <i data-lucide="${m.read ? 'mail' : 'mail-check'}" style="width: 14px; height: 14px;"></i>
          </button>
          <a class="btn btn-secondary btn-sm" href="mailto:${escapeHTML(m.email)}" title="Direct Email Reply">
            <i data-lucide="send" style="width: 14px; height: 14px;"></i>
          </a>
          <button class="btn btn-danger btn-sm" title="Delete" onclick="deleteMessage('${m.id}')">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filterMessages(mode) {
  renderMessagesTable(mode);
}

async function toggleMessageRead(id) {
  try {
    await apiFetch(`/admin/messages/${id}/read`, { method: 'POST' });
    await loadAllData();
  } catch (err) {
    showToast('Failed to update status.', 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Delete this inquiry?')) return;
  try {
    await apiFetch(`/admin/messages/${id}`, { method: 'DELETE' });
    showToast('Inquiry deleted.', 'success');
    await loadAllData();
  } catch (err) {
    showToast('Failed to delete.', 'error');
  }
}

// ==========================================
// 11. SECURITY & BACKUP TAB
// ==========================================
async function changePassword() {
  const currentPassword = document.getElementById('current-password').value;
  const newUsername = document.getElementById('new-username').value.trim();
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match!', 'error');
    return;
  }

  try {
    await apiFetch('/admin/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword, newUsername: newUsername || undefined }
    });
    showToast('Admin credentials updated successfully!', 'success');
    document.getElementById('password-form').reset();
  } catch (err) {
    showToast(err.message || 'Error updating password.', 'error');
  }
}

async function exportBackupData() {
  try {
    const backup = await apiFetch('/admin/backup');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ahonaf_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup downloaded successfully!', 'success');
  } catch (err) {
    showToast('Failed to export backup.', 'error');
  }
}

function importBackupData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.siteData) throw new Error('Invalid backup file structure.');

      await apiFetch('/admin/restore', { method: 'POST', body: parsed });
      showToast('Backup restored successfully!', 'success');
      await loadAllData();
    } catch (err) {
      showToast('Invalid backup file: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 12. UTILITIES & IMAGE UPLOAD
// ==========================================
function uploadImage(file, callback) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    try {
      const res = await apiFetch('/admin/upload', {
        method: 'POST',
        body: { filename: file.name, base64 }
      });
      if (res.success && res.url) {
        callback(res.url);
      }
    } catch (err) {
      showToast('Image upload failed: ' + err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="width: 18px; height: 18px;"></i>
    <span>${escapeHTML(message)}</span>
  `;
  container.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
