const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');
const SITE_DATA_FILE = path.join(DATA_DIR, 'site-data.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// JSON file helpers
function readJSON(filePath, defaultVal = {}) {
  try {
    if (!fs.existsSync(filePath)) return defaultVal;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return defaultVal;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
    return false;
  }
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Read body helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 25 * 1024 * 1024) { // 25MB max
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Authentication verification
function verifyAuth(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7).trim();
  if (!token) return false;

  const adminData = readJSON(ADMIN_FILE, { sessions: [] });
  const validSession = (adminData.sessions || []).find(s => s.token === token);
  if (!validSession) return false;

  // Check if session expired (e.g. 7 days)
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - new Date(validSession.createdAt).getTime() > maxAge) {
    adminData.sessions = adminData.sessions.filter(s => s.token !== token);
    writeJSON(ADMIN_FILE, adminData);
    return false;
  }
  return true;
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;

  // ==========================================
  // PUBLIC API: Site Data
  // ==========================================
  if (pathname === '/api/site-data' && req.method === 'GET') {
    const siteData = readJSON(SITE_DATA_FILE, {});
    return sendJSON(res, 200, siteData);
  }

  // ==========================================
  // PUBLIC API: Contact Form Submission
  // ==========================================
  if (pathname === '/api/contact' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const name = (body.name || '').trim();
      const email = (body.email || '').trim();
      const message = (body.message || '').trim();

      if (!name || !email || !message) {
        return sendJSON(res, 400, { success: false, error: 'Name, email and message are required.' });
      }

      const messages = readJSON(MESSAGES_FILE, []);
      const newMsg = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name,
        email,
        service: body.service || 'general',
        budget: body.budget || 'unspecified',
        message,
        date: new Date().toISOString(),
        read: false
      };

      messages.unshift(newMsg);
      writeJSON(MESSAGES_FILE, messages);

      return sendJSON(res, 201, { success: true, message: 'Inquiry received successfully!', data: newMsg });
    } catch (e) {
      return sendJSON(res, 500, { success: false, error: e.message });
    }
  }

  // ==========================================
  // AUTH API: Login
  // ==========================================
  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { username, password } = body;
      const adminData = readJSON(ADMIN_FILE, {});

      if (username === adminData.username && sha256(password || '') === adminData.passwordHash) {
        const token = crypto.randomBytes(32).toString('hex');
        adminData.sessions = adminData.sessions || [];
        adminData.sessions.push({ token, createdAt: new Date().toISOString() });
        adminData.lastLogin = new Date().toISOString();
        writeJSON(ADMIN_FILE, adminData);

        return sendJSON(res, 200, {
          success: true,
          token,
          username: adminData.username,
          message: 'Authentication successful.'
        });
      } else {
        return sendJSON(res, 401, { success: false, error: 'Invalid username or password.' });
      }
    } catch (e) {
      return sendJSON(res, 500, { success: false, error: e.message });
    }
  }

  // ==========================================
  // AUTH API: Logout
  // ==========================================
  if (pathname === '/api/logout' && req.method === 'POST') {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const adminData = readJSON(ADMIN_FILE, {});
      adminData.sessions = (adminData.sessions || []).filter(s => s.token !== token);
      writeJSON(ADMIN_FILE, adminData);
    }
    return sendJSON(res, 200, { success: true, message: 'Logged out successfully.' });
  }

  // ==========================================
  // AUTH API: Verify Session
  // ==========================================
  if (pathname === '/api/auth/check' && req.method === 'GET') {
    const isAuthed = verifyAuth(req);
    const adminData = readJSON(ADMIN_FILE, {});
    return sendJSON(res, isAuthed ? 200 : 401, {
      authenticated: isAuthed,
      username: isAuthed ? adminData.username : null
    });
  }

  // ==========================================
  // PROTECTED ADMIN APIS
  // ==========================================
  if (pathname.startsWith('/api/admin/')) {
    if (!verifyAuth(req)) {
      return sendJSON(res, 401, { success: false, error: 'Unauthorized: Admin session required.' });
    }

    // 1. Change password / username
    if (pathname === '/api/admin/change-password' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { currentPassword, newPassword, newUsername } = body;
        const adminData = readJSON(ADMIN_FILE, {});

        if (sha256(currentPassword || '') !== adminData.passwordHash) {
          return sendJSON(res, 400, { success: false, error: 'Current password is incorrect.' });
        }

        if (newPassword && newPassword.length >= 6) {
          adminData.passwordHash = sha256(newPassword);
        }
        if (newUsername && newUsername.trim()) {
          adminData.username = newUsername.trim();
        }

        writeJSON(ADMIN_FILE, adminData);
        return sendJSON(res, 200, { success: true, message: 'Credentials updated successfully!' });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    // 2. Profile & Hero update
    if (pathname === '/api/admin/profile' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const siteData = readJSON(SITE_DATA_FILE, {});
        siteData.profile = Object.assign(siteData.profile || {}, body);
        writeJSON(SITE_DATA_FILE, siteData);
        return sendJSON(res, 200, { success: true, message: 'Profile updated!', data: siteData.profile });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    // 3. Marquee ticker update
    if (pathname === '/api/admin/marquee' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const siteData = readJSON(SITE_DATA_FILE, {});
        if (Array.isArray(body.marquee)) {
          siteData.marquee = body.marquee;
          writeJSON(SITE_DATA_FILE, siteData);
          return sendJSON(res, 200, { success: true, message: 'Marquee updated!', data: siteData.marquee });
        }
        return sendJSON(res, 400, { success: false, error: 'Expected marquee array.' });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    // 4. Projects: Get all
    if (pathname === '/api/admin/projects' && req.method === 'GET') {
      const siteData = readJSON(SITE_DATA_FILE, {});
      return sendJSON(res, 200, siteData.projects || []);
    }

    // 5. Projects: Save / Update
    if (pathname === '/api/admin/projects' && req.method === 'POST') {
      try {
        const project = await parseBody(req);
        const siteData = readJSON(SITE_DATA_FILE, {});
        siteData.projects = siteData.projects || [];

        if (!project.id) {
          project.id = 'project-' + Date.now();
          siteData.projects.unshift(project);
        } else {
          const idx = siteData.projects.findIndex(p => p.id === project.id);
          if (idx !== -1) {
            siteData.projects[idx] = Object.assign(siteData.projects[idx], project);
          } else {
            siteData.projects.unshift(project);
          }
        }

        writeJSON(SITE_DATA_FILE, siteData);
        return sendJSON(res, 200, { success: true, message: 'Project saved!', data: project });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    // 6. Projects: Delete
    if (pathname.startsWith('/api/admin/projects/') && req.method === 'DELETE') {
      const projectId = pathname.replace('/api/admin/projects/', '').trim();
      const siteData = readJSON(SITE_DATA_FILE, {});
      siteData.projects = (siteData.projects || []).filter(p => p.id !== projectId);
      writeJSON(SITE_DATA_FILE, siteData);
      return sendJSON(res, 200, { success: true, message: 'Project deleted!' });
    }

    // 7. Services: Save all or single
    if (pathname === '/api/admin/services' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const siteData = readJSON(SITE_DATA_FILE, {});
        if (Array.isArray(body)) {
          siteData.services = body;
        } else if (body.id) {
          siteData.services = siteData.services || [];
          const idx = siteData.services.findIndex(s => s.id === body.id);
          if (idx !== -1) siteData.services[idx] = Object.assign(siteData.services[idx], body);
          else siteData.services.push(body);
        } else {
          body.id = 'service-' + Date.now();
          siteData.services = siteData.services || [];
          siteData.services.push(body);
        }
        writeJSON(SITE_DATA_FILE, siteData);
        return sendJSON(res, 200, { success: true, message: 'Services updated!', data: siteData.services });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    // 8. Services: Delete
    if (pathname.startsWith('/api/admin/services/') && req.method === 'DELETE') {
      const serviceId = pathname.replace('/api/admin/services/', '').trim();
      const siteData = readJSON(SITE_DATA_FILE, {});
      siteData.services = (siteData.services || []).filter(s => s.id !== serviceId);
      writeJSON(SITE_DATA_FILE, siteData);
      return sendJSON(res, 200, { success: true, message: 'Service deleted!' });
    }

    // 9. Skills: Save all
    if (pathname === '/api/admin/skills' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const siteData = readJSON(SITE_DATA_FILE, {});
        if (Array.isArray(body)) {
          siteData.skills = body;
          writeJSON(SITE_DATA_FILE, siteData);
          return sendJSON(res, 200, { success: true, message: 'Skills updated!', data: siteData.skills });
        }
        return sendJSON(res, 400, { success: false, error: 'Expected skills array.' });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    // 10. Messages: Get all
    if (pathname === '/api/admin/messages' && req.method === 'GET') {
      const messages = readJSON(MESSAGES_FILE, []);
      return sendJSON(res, 200, messages);
    }

    // 11. Messages: Toggle Read
    if (pathname.startsWith('/api/admin/messages/') && pathname.endsWith('/read') && req.method === 'POST') {
      const msgId = pathname.replace('/api/admin/messages/', '').replace('/read', '').trim();
      const messages = readJSON(MESSAGES_FILE, []);
      const msg = messages.find(m => m.id === msgId);
      if (msg) {
        msg.read = !msg.read;
        writeJSON(MESSAGES_FILE, messages);
        return sendJSON(res, 200, { success: true, data: msg });
      }
      return sendJSON(res, 404, { success: false, error: 'Message not found.' });
    }

    // 12. Messages: Delete
    if (pathname.startsWith('/api/admin/messages/') && req.method === 'DELETE') {
      const msgId = pathname.replace('/api/admin/messages/', '').trim();
      let messages = readJSON(MESSAGES_FILE, []);
      messages = messages.filter(m => m.id !== msgId);
      writeJSON(MESSAGES_FILE, messages);
      return sendJSON(res, 200, { success: true, message: 'Message deleted!' });
    }

    // 13. File Upload (Base64 image)
    if (pathname === '/api/admin/upload' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { filename, base64 } = body;
        if (!filename || !base64) {
          return sendJSON(res, 400, { success: false, error: 'Filename and base64 data required.' });
        }

        // Clean filename and extract ext
        const safeExt = path.extname(filename).toLowerCase() || '.png';
        const cleanName = path.basename(filename, safeExt).replace(/[^a-zA-Z0-9_-]/g, '_');
        const targetFilename = `${Date.now()}_${cleanName}${safeExt}`;
        const targetPath = path.join(UPLOADS_DIR, targetFilename);

        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');

        fs.writeFileSync(targetPath, buffer);
        const fileUrl = `assets/uploads/${targetFilename}`;

        return sendJSON(res, 200, { success: true, url: fileUrl, filename: targetFilename });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    // 14. Full Site Backup / Export
    if (pathname === '/api/admin/backup' && req.method === 'GET') {
      const siteData = readJSON(SITE_DATA_FILE, {});
      const messages = readJSON(MESSAGES_FILE, []);
      return sendJSON(res, 200, {
        exportDate: new Date().toISOString(),
        siteData,
        messages
      });
    }

    // 15. Full Site Restore / Import
    if (pathname === '/api/admin/restore' && req.method === 'POST') {
      try {
        const body = await parseBody(req);
        if (body.siteData) writeJSON(SITE_DATA_FILE, body.siteData);
        if (body.messages) writeJSON(MESSAGES_FILE, body.messages);
        return sendJSON(res, 200, { success: true, message: 'Backup restored successfully!' });
      } catch (e) {
        return sendJSON(res, 500, { success: false, error: e.message });
      }
    }

    return sendJSON(res, 404, { success: false, error: 'API route not found.' });
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let safeUrl = pathname;
  if (safeUrl === '/' || safeUrl === '') {
    safeUrl = '/index.html';
  } else if (safeUrl === '/admin' || safeUrl === '/admin/') {
    safeUrl = '/admin/index.html';
  }

  // Sanitize path against directory traversal
  const resolvedPath = path.normalize(path.join(__dirname, safeUrl));
  if (!resolvedPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  let finalPath = resolvedPath;
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    finalPath = path.join(resolvedPath, 'index.html');
  }

  const ext = path.extname(finalPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(finalPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Admin panel available at http://localhost:${PORT}/admin/`);
});
