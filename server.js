/* ==========================================================================
   PRV CONSULTANCY SERVICES - MASTER BACKEND SERVER
   Built-in Node.js SQLite Database Architecture & REST API Endpoints
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const DB_PATH = path.join(__dirname, 'prv_consultancy.db');

// 1. INITIALIZE SQLITE DATABASE & SCHEMAS
const db = new DatabaseSync(DB_PATH);

// Create Table 1: client_enquiries
db.exec(`
  CREATE TABLE IF NOT EXISTS client_enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    full_name TEXT NOT NULL,
    company_name TEXT,
    designation TEXT,
    mobile_number TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT,
    state TEXT,
    industry TEXT,
    company_size TEXT,
    service_required TEXT NOT NULL,
    message TEXT,
    source TEXT DEFAULT 'Website Form',
    status TEXT DEFAULT 'New',
    assigned_to TEXT DEFAULT 'Unassigned',
    follow_up_date TEXT,
    remarks TEXT
  );
`);

// Create Table 2: seminar_registrations
db.exec(`
  CREATE TABLE IF NOT EXISTS seminar_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    full_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT,
    qualification TEXT,
    organization TEXT,
    seminar_name TEXT NOT NULL,
    training_type TEXT DEFAULT 'Industrial Training',
    number_of_participants INTEGER DEFAULT 1,
    message TEXT,
    status TEXT DEFAULT 'Registered',
    remarks TEXT
  );
`);

console.log('PRV Consultancy Databases (client_enquiries & seminar_registrations) initialized successfully.');

// Insert Sample Data if Empty for Demonstration & Immediate CRM Dashboard Visuals
const countStmt = db.prepare('SELECT COUNT(*) as count FROM client_enquiries');
const { count } = countStmt.get();
if (count === 0) {
  const insertSample = db.prepare(`
    INSERT INTO client_enquiries (full_name, company_name, designation, mobile_number, email, city, state, industry, company_size, service_required, message, source, status, assigned_to, follow_up_date, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSample.run(
    'Rajesh Kumar', 'Apex Manufacturing Pvt Ltd', 'Operations Head', '+91 9876543210', 'rajesh@apexmfg.in',
    'Pune', 'Maharashtra', 'Manufacturing', '50-250 Employees', 'ZED Certification',
    'Looking to apply for ZED Gold certification and claim government subsidy.', 'Website Form', 'New', 'Unassigned', '2026-08-05', 'High priority MSME lead'
  );

  insertSample.run(
    'Ananya Sharma', 'TexStyles Global', 'Quality Manager', '+91 9812345678', 'ananya@texstyles.com',
    'Surat', 'Gujarat', 'Textile & Apparel', '250+ Employees', 'SEDEX / SMETA',
    'Need 4-Pillar SMETA audit preparation for upcoming buyer audit.', 'Popup Form', 'Contacted', 'Consultant Team A', '2026-08-04', 'Sent proposal PDF via email'
  );

  insertSample.run(
    'Vikram Malhotra', 'AutoTech Components', 'General Manager', '+91 9988776655', 'v.malhotra@autotech.co.in',
    'Gurugram', 'Haryana', 'Automotive', '100-500 Employees', 'IATF 16949',
    'Core Tools training (APQP, PFMEA, PPAP) required for production engineers.', 'Header CTA', 'Quotation Sent', 'Sales Lead Rohit', '2026-08-06', 'Quotation Q-2026-104 sent'
  );

  insertSample.run(
    'Meera Nair', 'Innovatech Systems', 'HR Lead', '+91 9765432109', 'meera@innovatech.io',
    'Bengaluru', 'Karnataka', 'IT & Tech Solutions', '20-50 Employees', 'NATS',
    'Want to onboard 15 engineering apprentices under NATS scheme.', 'Floating Button', 'Converted', 'Apprenticeship Dept', '2026-08-10', 'Contract signed. Onboarding started.'
  );

  const insertSampleSeminar = db.prepare(`
    INSERT INTO seminar_registrations (full_name, mobile_number, email, city, qualification, organization, seminar_name, training_type, number_of_participants, message, status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSampleSeminar.run(
    'Suresh Verma', '+91 9898989898', 'suresh.verma@gmail.com', 'Noida', 'B.Tech Mechanical',
    'Precision Auto Components', 'Master Business Excellence Workshop', 'Corporate Training', 3,
    'Enrolling senior floor supervisors for 5S & Kaizen masterclass.', 'Registered', 'Confirmed slot'
  );
}

// 2. MIME TYPE MAPPER
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

// 3. HELPER TO PARSE JSON BODY
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

// 4. MAIN HTTP REQUEST ROUTER
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS & JSON Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ------------------------------------------------------------------------
  // REST API ROUTES
  // ------------------------------------------------------------------------

  // POST /api/enquiries - Create New Client Enquiry
  if (pathname === '/api/enquiries' && method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const {
        full_name, company_name, designation, mobile_number, email,
        city, state, industry, company_size, service_required, message, source
      } = data;

      if (!full_name || !mobile_number || !email || !service_required) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Required fields missing (full_name, mobile_number, email, service_required).' }));
        return;
      }

      const insertStmt = db.prepare(`
        INSERT INTO client_enquiries 
        (full_name, company_name, designation, mobile_number, email, city, state, industry, company_size, service_required, message, source, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')
      `);

      const result = insertStmt.run(
        full_name,
        company_name || '',
        designation || '',
        mobile_number,
        email,
        city || '',
        state || '',
        industry || 'General',
        company_size || '',
        service_required,
        message || '',
        source || 'Website Form'
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Enquiry saved successfully in client_enquiries database!',
        id: Number(result.lastInsertRowid)
      }));
    } catch (err) {
      console.error('Error inserting enquiry:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error saving enquiry.' }));
    }
    return;
  }

  // GET /api/enquiries - Retrieve Enquiries with Search & Filter
  if (pathname === '/api/enquiries' && method === 'GET') {
    try {
      const search = parsedUrl.searchParams.get('search') || '';
      const service = parsedUrl.searchParams.get('service') || '';
      const status = parsedUrl.searchParams.get('status') || '';

      let query = `SELECT * FROM client_enquiries WHERE 1=1`;
      const params = [];

      if (search) {
        query += ` AND (full_name LIKE ? OR company_name LIKE ? OR email LIKE ? OR mobile_number LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      if (service) {
        query += ` AND service_required = ?`;
        params.push(service);
      }

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC`;

      const stmt = db.prepare(query);
      const rows = stmt.all(...params);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error retrieving enquiries.' }));
    }
    return;
  }

  // PATCH /api/enquiries/:id - Update Lead Status, Remarks, Follow-up Date, Assigned To
  if (pathname.startsWith('/api/enquiries/') && method === 'PATCH') {
    const id = pathname.split('/')[3];
    try {
      const data = await parseJsonBody(req);
      const { status, assigned_to, follow_up_date, remarks } = data;

      const updateStmt = db.prepare(`
        UPDATE client_enquiries
        SET status = COALESCE(?, status),
            assigned_to = COALESCE(?, assigned_to),
            follow_up_date = COALESCE(?, follow_up_date),
            remarks = COALESCE(?, remarks)
        WHERE id = ?
      `);

      updateStmt.run(status, assigned_to, follow_up_date, remarks, id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Enquiry #${id} updated successfully.` }));
    } catch (err) {
      console.error('Error updating enquiry:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error updating enquiry in database.' }));
    }
    return;
  }

  // DELETE /api/enquiries/:id - Delete Enquiry
  if (pathname.startsWith('/api/enquiries/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    try {
      const deleteStmt = db.prepare(`DELETE FROM client_enquiries WHERE id = ?`);
      deleteStmt.run(id);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Enquiry #${id} deleted.` }));
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error deleting enquiry.' }));
    }
    return;
  }

  // POST /api/seminars - Create Seminar Registration
  if (pathname === '/api/seminars' && method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const {
        full_name, mobile_number, email, city, qualification,
        organization, seminar_name, training_type, number_of_participants, message
      } = data;

      if (!full_name || !mobile_number || !email || !seminar_name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Required fields missing for seminar registration.' }));
        return;
      }

      const insertStmt = db.prepare(`
        INSERT INTO seminar_registrations
        (full_name, mobile_number, email, city, qualification, organization, seminar_name, training_type, number_of_participants, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertStmt.run(
        full_name,
        mobile_number,
        email,
        city || '',
        qualification || '',
        organization || '',
        seminar_name,
        training_type || 'Industrial Training',
        number_of_participants || 1,
        message || ''
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Seminar registration saved successfully in seminar_registrations database!',
        id: Number(result.lastInsertRowid)
      }));
    } catch (err) {
      console.error('Error saving seminar registration:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error saving seminar registration.' }));
    }
    return;
  }

  // GET /api/seminars - Retrieve Seminar Registrations
  if (pathname === '/api/seminars' && method === 'GET') {
    try {
      const stmt = db.prepare(`SELECT * FROM seminar_registrations ORDER BY created_at DESC`);
      const rows = stmt.all();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
    } catch (err) {
      console.error('Error fetching seminars:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error fetching seminar registrations.' }));
    }
    return;
  }

  // GET /api/dashboard/stats - Admin Dashboard Metrics & Analytics
  if (pathname === '/api/dashboard/stats' && method === 'GET') {
    try {
      const totalEnquiries = db.prepare('SELECT COUNT(*) as c FROM client_enquiries').get().c;
      const todayEnquiries = db.prepare(`SELECT COUNT(*) as c FROM client_enquiries WHERE DATE(created_at) = DATE('now')`).get().c;
      const pendingEnquiries = db.prepare(`SELECT COUNT(*) as c FROM client_enquiries WHERE status IN ('New', 'Contacted', 'Quotation Sent')`).get().c;
      const convertedEnquiries = db.prepare(`SELECT COUNT(*) as c FROM client_enquiries WHERE status = 'Converted'`).get().c;
      const seminarCount = db.prepare('SELECT COUNT(*) as c FROM seminar_registrations').get().c;

      const serviceDistribution = db.prepare(`
        SELECT service_required as service, COUNT(*) as count 
        FROM client_enquiries 
        GROUP BY service_required 
        ORDER BY count DESC 
        LIMIT 5
      `).all();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        stats: {
          totalEnquiries,
          todayEnquiries,
          pendingEnquiries,
          convertedEnquiries,
          seminarCount
        },
        serviceDistribution
      }));
    } catch (err) {
      console.error('Error calculating stats:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error compiling dashboard statistics.' }));
    }
    return;
  }

  // GET /api/enquiries/export - Export Enquiries as CSV
  if (pathname === '/api/enquiries/export' && method === 'GET') {
    try {
      const rows = db.prepare(`SELECT * FROM client_enquiries ORDER BY created_at DESC`).all();
      
      let csv = 'ID,Date,Full Name,Company,Designation,Mobile,Email,City,State,Industry,Company Size,Service,Status,Assigned To,Follow-up Date,Remarks\n';
      rows.forEach(r => {
        csv += `"${r.id}","${r.created_at}","${(r.full_name||'').replace(/"/g, '""')}","${(r.company_name||'').replace(/"/g, '""')}","${(r.designation||'').replace(/"/g, '""')}","${r.mobile_number}","${r.email}","${r.city||''}","${r.state||''}","${r.industry||''}","${r.company_size||''}","${r.service_required}","${r.status}","${r.assigned_to||''}","${r.follow_up_date||''}","${(r.remarks||'').replace(/"/g, '""')}"\n`;
      });

      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="PRV_Client_Enquiries.csv"'
      });
      res.end(csv);
    } catch (err) {
      console.error('CSV export error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'CSV export error.' }));
    }
    return;
  }

  // POST /api/auth/login - Admin Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const { username, password } = data;

      if ((username === 'admin' || username === 'sales') && password === 'admin123') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token: 'prv_session_token_' + Date.now(),
          user: { name: username === 'admin' ? 'Master Admin' : 'Sales Lead', role: username }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid credentials. Use admin / admin123' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Auth error' }));
    }
    return;
  }

  // ------------------------------------------------------------------------
  // STATIC FILE SERVING
  // ------------------------------------------------------------------------
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
