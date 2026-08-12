/* ==========================================================================
   PRV CONSULTANCY SERVICES - MASTER BACKEND SERVER
   Local Development & API Proxy Layer for Vercel Serverless Handlers
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch (e) {}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Route API requests to Vercel Serverless Handlers for 100% parity
const apiHandlers = {
  '/api/chat': require('./api/chat'),
  '/api/ai/chat': require('./api/ai/chat'),
  '/api/enquiries': require('./api/enquiries/index'),
  '/api/enquiries/export': require('./api/enquiries/export'),
  '/api/seminars': require('./api/seminars'),
  '/api/appointments': require('./api/appointments'),
  '/api/dashboard/stats': require('./api/dashboard/stats'),
  '/api/ai/training': require('./api/ai/training/index'),
  '/api/ai/book-consultation': require('./api/ai/book-consultation'),
  '/api/ai/logs': require('./api/ai/logs'),
  '/api/prv-ai/knowledge': require('./api/prv-ai/knowledge'),
  '/api/auth/login': require('./api/auth/login')
};

const enquiriesIdHandler = require('./api/enquiries/[id]');
const trainingIdHandler = require('./api/ai/training/[id]');

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Delegate API endpoints to serverless function modules
  if (pathname.startsWith('/api/')) {
    // Match /api/enquiries/export explicitly before /api/enquiries/:id
    if (pathname === '/api/enquiries/export') {
      return apiHandlers['/api/enquiries/export'](req, res);
    }

    // Match /api/enquiries/:id
    const enquiryIdMatch = pathname.match(/^\/api\/enquiries\/(\d+)$/);
    if (enquiryIdMatch) {
      req.query = req.query || {};
      req.query.id = enquiryIdMatch[1];
      return enquiriesIdHandler(req, res);
    }

    // Match /api/ai/training/:id
    const trainingIdMatch = pathname.match(/^\/api\/ai\/training\/(\d+)$/);
    if (trainingIdMatch) {
      req.query = req.query || {};
      req.query.id = trainingIdMatch[1];
      return trainingIdHandler(req, res);
    }

    // Match exact API handlers
    if (apiHandlers[pathname]) {
      return apiHandlers[pathname](req, res);
    }
  }

  // Serve static files for local development
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(PUBLIC_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found - PRV Consultancy Services</h1>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`===========================================================`);
  console.log(`PRV CONSULTANCY SERVICES - MASTER ENTERPRISE BACKEND ONLINE`);
  console.log(`Website: http://localhost:${PORT}`);
  console.log(`CRM Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`===========================================================`);
});
