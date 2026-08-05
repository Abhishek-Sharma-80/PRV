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
const KB_PATH = path.join(__dirname, 'knowledge', 'prv_knowledge_base.json');

// Load Knowledge Base
let knowledgeBase = { company: {}, guides: {}, comparisons: {} };
try {
  if (fs.existsSync(KB_PATH)) {
    knowledgeBase = JSON.parse(fs.readFileSync(KB_PATH, 'utf-8'));
    console.log('PRV Knowledge Base loaded successfully with 17 guides and comparison matrices.');
  }
} catch (kbErr) {
  console.warn('Warning: Could not load prv_knowledge_base.json:', kbErr.message);
}

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

// Create Table 3: ai_conversations
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    detected_service TEXT DEFAULT 'General',
    lead_captured INTEGER DEFAULT 0
  );
`);

console.log('PRV Consultancy Databases (client_enquiries, seminar_registrations & ai_conversations) initialized successfully.');

// Insert Sample Data if Empty for Demonstration & Immediate CRM Dashboard Visuals
const countStmt = db.prepare('SELECT COUNT(*) as count FROM client_enquiries');
const { count } = countStmt.get();
if (count === 0) {
  const insertSample = db.prepare(`
    INSERT INTO client_enquiries (full_name, company_name, designation, mobile_number, email, city, state, industry, company_size, service_required, message, source, status, assigned_to, follow_up_date, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSample.run(
    'Rajesh Kumar', 'Apex Manufacturing Pvt Ltd', 'Operations Head', '+91 7489 351 297', 'rajesh@apexmfg.in',
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

  // ------------------------------------------------------------------------
  // AI ASSISTANT API ROUTES
  // ------------------------------------------------------------------------

  // POST /api/ai/book-consultation - Schedule FREE Consultation
  if (pathname === '/api/ai/book-consultation' && method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const { full_name, mobile_number, email, company_name, industry, service_required, preferred_date, preferred_time, notes } = data;

      if (!full_name || !mobile_number) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Name and Mobile Number are required.' }));
        return;
      }

      const insertStmt = db.prepare(`
        INSERT INTO client_enquiries 
        (full_name, mobile_number, email, company_name, industry, service_required, message, source, status, follow_up_date, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'AI Consultation Booking', 'Consultation Booked', ?, ?)
      `);

      const result = insertStmt.run(
        full_name,
        mobile_number,
        email || 'not_provided@prvconsultancy.com',
        company_name || '',
        industry || 'General',
        service_required || 'FREE Expert Consultation',
        `Booked Appointment for ${preferred_date || 'Earliest Slot'} at ${preferred_time || 'Convenient Time'}. Notes: ${notes || 'None'}`,
        preferred_date || new Date().toISOString().split('T')[0],
        `Preferred Slot: ${preferred_date || 'TBD'} ${preferred_time || ''}`
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Free consultation booked successfully! A PRV Senior Business Advisor will contact you.',
        booking_id: Number(result.lastInsertRowid)
      }));
    } catch (err) {
      console.error('Error booking consultation:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error booking consultation.' }));
    }
    return;
  }

  // POST /api/ai/chat - Process Natural Language AI Assistant Query
  if (pathname === '/api/ai/chat' && method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const userMessage = (data.message || '').trim();
      const sessionId = data.sessionId || 'session_' + Date.now();

      if (!userMessage) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Message content is required.' }));
        return;
      }

      const msgLower = userMessage.toLowerCase();
      let aiResponse = '';
      let detectedService = 'General';
      let quickReplies = [];
      let leadCaptured = 0;
      let actionType = null;

      // ------------------------------------------------------------------------
      // MULTI-LANGUAGE AUTOMATIC DETECTION & SESSION MEMORY ENGINE
      // ------------------------------------------------------------------------

      // In-memory language session store
      global.languageSessions = global.languageSessions || {};

      function detectLanguage(text, sessId) {
        if (!text) return global.languageSessions[sessId] || 'english';
        const txt = text.toLowerCase();

        // 1. Explicit request to switch language
        if (txt.includes('speak hindi') || txt.includes('hindi me') || txt.includes('हिंदी में')) {
          global.languageSessions[sessId] = 'hindi';
          return 'hindi';
        }
        if (txt.includes('speak hinglish') || txt.includes('hinglish me')) {
          global.languageSessions[sessId] = 'hinglish';
          return 'hinglish';
        }
        if (txt.includes('speak english') || txt.includes('in english')) {
          global.languageSessions[sessId] = 'english';
          return 'english';
        }

        // 2. Unicode Script Detection
        if (/[\u0900-\u097F]/.test(text)) {
          global.languageSessions[sessId] = 'hindi';
          return 'hindi';
        }
        if (/[\u0B80-\u0BFF]/.test(text)) {
          global.languageSessions[sessId] = 'tamil';
          return 'tamil';
        }
        if (/[\u0C00-\u0C7F]/.test(text)) {
          global.languageSessions[sessId] = 'telugu';
          return 'telugu';
        }
        if (/[\u0A80-\u0AFF]/.test(text)) {
          global.languageSessions[sessId] = 'gujarati';
          return 'gujarati';
        }
        if (/[\u0A00-\u0A7F]/.test(text)) {
          global.languageSessions[sessId] = 'punjabi';
          return 'punjabi';
        }
        if (/[\u0980-\u09FF]/.test(text)) {
          global.languageSessions[sessId] = 'bengali';
          return 'bengali';
        }
        if (/[\u0600-\u06FF]/.test(text)) {
          global.languageSessions[sessId] = 'urdu';
          return 'urdu';
        }

        // 3. Hinglish Keyword Pattern Matching (Refined to eliminate false positive English triggers like 'tell me')
        const hinglishKeywords = ['kya', 'kaise', 'hai', 'hain', 'hoo', 'batao', 'chahiye', 'kitna', 'lagela', 'lagta', 'kare', 'kaun', 'mujhko', 'mujhe', 'aapka', 'aapki', 'mein', 'hoga', 'hogi', 'karo', 'karenge', 'baare', 'samjhao'];
        const words = txt.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
        const matchCount = words.filter(w => hinglishKeywords.includes(w)).length;

        if (matchCount >= 1 && !txt.startsWith('http')) {
          global.languageSessions[sessId] = 'hinglish';
          return 'hinglish';
        }

        // Fallback to session memory or default to English
        const activeLang = global.languageSessions[sessId] || 'english';
        return activeLang;
      }

      const userLang = detectLanguage(userMessage, sessionId);

      // Extract phone number or email from message for auto-lead generation
      const phoneMatch = userMessage.match(/(?:\+91[\s-]?)?[6-9]\d{9}/);
      const emailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

      if (phoneMatch || emailMatch) {
        const capturedPhone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '';
        const capturedEmail = emailMatch ? emailMatch[0] : '';
        
        try {
          const insertLead = db.prepare(`
            INSERT INTO client_enquiries 
            (full_name, mobile_number, email, service_required, message, source, status, remarks)
            VALUES (?, ?, ?, ?, ?, 'AI Assistant', 'New', 'Lead auto-captured by PRV AI Consultant')
          `);
          insertLead.run(
            'AI Chat Prospect',
            capturedPhone || 'Provided via Chat',
            capturedEmail || 'ai_chat@prvconsultancy.com',
            'AI Business Consultation',
            `User Chat Inquiry (${userLang}): "${userMessage}"`
          );
          leadCaptured = 1;
        } catch (errLead) {
          console.error('AI Lead capture error:', errLead);
        }
      }

      const MANDATORY_CLOSING = "Would you like me to arrange a FREE consultation with one of our PRV business experts, or is there anything else you'd like to know?";

      function enforceClosing(text) {
        const trimmed = (text || '').trim();
        if (trimmed.endsWith(MANDATORY_CLOSING)) {
          return trimmed;
        }
        return `${trimmed}\n\n${MANDATORY_CLOSING}`;
      }

      // Helper function to build detailed guide answers according to 9-point consultant structure
      function buildGuideAnswer(guideKey) {
        const g = knowledgeBase.guides[guideKey];
        if (!g) return null;

        let res = `📘 **${g.title}**\n\n`;
        
        // 1. What it is
        if (g.introduction || g.what_it_is) {
          res += `• **What it is**: ${g.introduction || g.what_it_is}\n`;
        }
        // 2. Why required
        if (g.why_required || g.why_needed) {
          res += `• **Why it is required**: ${g.why_required || g.why_needed}\n`;
        }
        // 3. Who should use it
        if (g.eligibility || g.who_should_apply) {
          res += `• **Who should use it**: ${g.eligibility || g.who_should_apply}\n\n`;
        }
        // Subsidies / Levels (if any)
        if (g.levels_and_subsidies) {
          res += `💰 **Subsidies & Grants**:\n`;
          Object.entries(g.levels_and_subsidies).forEach(([lvl, detail]) => {
            res += `  - **${lvl}**: ${detail}\n`;
          });
          res += `\n`;
        }
        // Core Tools (if any)
        if (g.core_tools && Array.isArray(g.core_tools)) {
          res += `🛠️ **Automotive Core Tools Included**:\n`;
          g.core_tools.forEach(t => res += `  - ${t}\n`);
          res += `\n`;
        }
        // 4. Business benefits
        if (g.benefits && Array.isArray(g.benefits)) {
          res += `✨ **Business Benefits**:\n`;
          g.benefits.forEach(b => res += `  - ${b}\n`);
          res += `\n`;
        }
        // 5. Process
        if (g.process && Array.isArray(g.process)) {
          res += `📋 **Process**:\n`;
          g.process.forEach((p, idx) => res += `  ${idx + 1}. ${p}\n`);
          res += `\n`;
        }
        // 6. Documents required
        if (g.documents_required && Array.isArray(g.documents_required)) {
          res += `📄 **Documents Generally Required**:\n`;
          g.documents_required.forEach(d => res += `  - ${d}\n`);
          res += `\n`;
        }
        // 7. Timeline
        if (g.timeline || g.time_required) {
          res += `⏱️ **Timeline**: ${g.timeline || g.time_required}\n`;
        }
        // 8. Frequently Asked Questions
        if (g.faqs && Array.isArray(g.faqs) && g.faqs.length > 0) {
          res += `\n❓ **Frequently Asked Questions**:\n`;
          g.faqs.forEach(f => {
            res += `  - **Q: ${f.question}**\n    *A: ${f.answer}*\n`;
          });
          res += `\n`;
        }
        // 9. How PRV Consultancy helps
        if (g.prv_approach || g.how_prv_helps) {
          res += `🤝 **How PRV Consultancy Helps**: ${g.prv_approach || g.how_prv_helps}\n\n`;
        }
        // Recommended solution / verdict
        if (g.prv_recommended_solution) {
          res += `🎯 **PRV Consultant Recommendation**: ${g.prv_recommended_solution}\n\n`;
        }

        return res;
      }

      function buildComparisonTable(compKey) {
        const c = knowledgeBase.comparisons[compKey];
        if (!c) return null;

        let res = `📊 **${c.title} - Comparison Matrix**\n\n`;
        c.table.forEach((row, idx) => {
          if (idx === 0) {
            res += `| ${row[0]} | ${row[1]} | ${row[2]} |\n`;
            res += `| --- | --- | --- |\n`;
          } else {
            res += `| **${row[0]}** | ${row[1]} | ${row[2]} |\n`;
          }
        });
        res += `\n🎯 **PRV Consultant Verdict**: ${c.verdict}\n\n`;
        return res;
      }

      // ------------------------------------------------------------------------
      // INTELLIGENT CONSULTING REASONING ENGINE
      // ------------------------------------------------------------------------

      // SCENARIO 1: AUTO PARTS MANUFACTURER QUERY ("My company manufactures auto parts. Which certification should I take?")
      if (
        (msgLower.includes('auto part') || msgLower.includes('auto component') || msgLower.includes('automotive') || msgLower.includes('car part') || msgLower.includes('oem supplier')) &&
        (msgLower.includes('which') || msgLower.includes('recommend') || msgLower.includes('take') || msgLower.includes('need') || msgLower.includes('certificate') || msgLower.includes('certification'))
      ) {
        detectedService = 'Auto Parts Certification Reasoning';
        aiResponse = `🚗 **PRV Consultant Strategic Analysis for Auto Parts Manufacturers**\n\nBased on your manufacturing profile as an automotive component producer, **you should NOT take generic certifications**. \n\nWe specifically recommend **IATF 16949:2016** (Automotive Quality Management System) along with the **5 Automotive Core Tools**.\n\n### Why IATF 16949 is Required for Your Business:\n1️⃣ **Mandatory OEM Empanelment**: Top automotive OEMs (Maruti Suzuki, Tata Motors, Hyundai, Mahindra, Hero MotoCorp) and Tier-1 suppliers strictly mandate IATF 16949 certification to award vendor purchase orders.\n2️⃣ **Zero-Defect Standard**: Automotive supply chains require zero PPM rejections, full traceability, and strict defect prevention.\n3️⃣ **5 Automotive Core Tools Mastery**:\n   - **APQP**: Advanced Product Quality Planning for new part development.\n   - **PPAP**: Production Part Approval Process for buyer sign-off.\n   - **FMEA**: Failure Mode & Effects Analysis to prevent shopfloor errors.\n   - **MSA**: Measurement Systems Analysis for gauge accuracy.\n   - **SPC**: Statistical Process Control to guarantee process capability (Cpk > 1.33).\n\n⏱️ **Timeline**: 2 to 3 months (includes shopfloor core tools implementation & audit handholding).\n🤝 **How PRV Helps**: PRV's automotive consultants implement Core Tools directly on your shopfloor and guarantee Tier-1/OEM audit clearance.`;
        quickReplies = ['IATF 16949 Roadmap', 'Core Tools Workshop', 'MACE Audit Prep', 'Book Free Consultation'];
      }

      // SCENARIO 2: EXPORT QUERY ("I want to export.")
      else if (
        msgLower === 'i want to export' || msgLower === 'i want to export.' || msgLower.includes('want to export') || msgLower.includes('exporting goods') || msgLower.includes('export certification')
      ) {
        detectedService = 'Export Certification Reasoning';
        
        if (msgLower.includes('food') || msgLower.includes('spices') || msgLower.includes('pharma') || msgLower.includes('cosmetics')) {
          aiResponse = `🌍 **PRV Consultant Export Solution for Food, Pharma & Cosmetics**\n\nTo export food or pharmaceutical products internationally, you require specific international regulatory clearances:\n\n1️⃣ **FDA Registration & Approval**: Mandatory for exporting food, cosmetics, and pharmaceuticals to the United States.\n2️⃣ **ISO 22000 / HACCP**: Global food safety certification required by international supermarket chains & buyers.\n3️⃣ **HALAL & Kosher Certification**: Essential for exporting to Middle East, SEA, and European food markets.\n4️⃣ **FSSAI Central License**: Mandatory statutory Indian license for export-import food operators.\n\n⏱️ **Timeline**: 2 to 4 weeks.`;
          quickReplies = ['FDA Approval Quote', 'ISO 22000 FSMS', 'HALAL Certification', 'Book Free Consultation'];
        }
        else if (msgLower.includes('machine') || msgLower.includes('electronic') || msgLower.includes('equipment') || msgLower.includes('device') || msgLower.includes('hardware')) {
          aiResponse = `🌍 **PRV Consultant Export Solution for Machinery & Electronics**\n\nFor exporting machinery, electricals, or industrial hardware, buyer regions require conformity marks:\n\n1️⃣ **CE Marking**: Mandatory European Union conformity certification for selling industrial machinery, electronics, and hardware in Europe.\n2️⃣ **RoHS & REACH Compliance**: Hazardous substance & chemical safety verification required for EU & UK markets.\n3️⃣ **ISO 9001:2015**: Globally recognized baseline quality management system for international buyers.\n\n⏱️ **Timeline**: 2 to 3 weeks.`;
          quickReplies = ['CE Marking Guide', 'RoHS Compliance', 'ISO 9001 Quote', 'Book Free Consultation'];
        }
        else if (msgLower.includes('textile') || msgLower.includes('garment') || msgLower.includes('apparel') || msgLower.includes('clothing')) {
          aiResponse = `🌍 **PRV Consultant Export Solution for Textiles & Apparel**\n\nFor exporting garments and textiles to Western buyers (Walmart, Zara, Disney, Target):\n\n1️⃣ **SEDEX / SMETA Ethical Audit (2 & 4 Pillar)**: Mandatory social, labor, safety, and business ethics audit.\n2️⃣ **GOTS / OEKO-TEX**: Global Organic Textile Standard & eco-friendly fabric safety certification.\n\n⏱️ **Timeline**: 1 to 3 weeks.`;
          quickReplies = ['Prepare for SMETA Audit', 'GOTS Certification', 'Book Free Consultation'];
        }
        else {
          // Missing product context - ask follow-up questions!
          aiResponse = `🌍 **PRV Consultant Export Certification Roadmap**\n\nExport certification requirements depend strictly on your **product category** and **target country**:\n\n• **Machinery & Electronics**: Require **CE Marking** & **RoHS/REACH** (European Union).\n• **Food, Pharma & Cosmetics**: Require **FDA Registration**, **ISO 22000 / HACCP**, and **HALAL**.\n• **Textiles & Consumer Goods**: Require **SEDEX / SMETA Ethical Audits** for global retail buyers.\n• **All Product Lines**: Require **ISO 9001:2015** as baseline quality assurance.\n\n👉 **To give you the exact export requirement**: What specific product does your company manufacture, and which country are you planning to export to?`;
          quickReplies = ['Exporting Machinery', 'Exporting Food/Pharma', 'Exporting Textiles', 'Book Free Consultation'];
        }
      }

      // SCENARIO 3: SUBSIDY QUERY ("I want government subsidy.")
      else if (
        msgLower === 'i want government subsidy' || msgLower === 'i want government subsidy.' || msgLower.includes('want subsidy') || msgLower.includes('government subsidy') || msgLower.includes('govt grant')
      ) {
        detectedService = 'Government Subsidy Reasoning';
        aiResponse = `💰 **PRV Consultant Analysis of Applicable Government Subsidies**\n\nPRV Consultancy helps MSMEs and industrial units claim direct government financial subsidies:\n\n1️⃣ **ZED (Zero Defect Zero Effect) MSME Scheme**:\n   - **Up to 80% Subsidy** on audit & certification costs.\n   - **₹10,000 Handholding Support Grant** for consultancy.\n   - **0.5% Concessional Bank Interest Rate** on business loans.\n   - **Up to ₹5 Lakhs Capital Subsidy** for testing equipment.\n\n2️⃣ **NATS & NAPS Apprenticeship Schemes**:\n   - Central Government stipend reimbursement up to **₹1,500/month per candidate**.\n   - **100% Exemption from PF & ESI** liabilities on apprentice stipends.\n\n3️⃣ **GeM & Startup India Subsidies**:\n   - EMD waiver on government tenders & fast-track patent grants.\n\n📋 **Eligibility Check**: Do you hold an active **Udyam MSME Registration** for your unit?`;
        quickReplies = ['ZED MSME Subsidy', 'NATS Stipend Subsidy', 'GeM Portal Info', 'Book Free Consultation'];
      }

      // SCENARIO 4: DISAMBIGUATION FOR GENERIC ISO QUERY ("What is ISO?" / "ISO kya hai?")
      else if (
        msgLower === 'what is iso' || msgLower === 'what is iso?' || msgLower === 'iso kya hai' || msgLower === 'iso kya hai?' || msgLower === 'iso' || msgLower === 'tell me about iso'
      ) {
        detectedService = 'ISO Professional Overview';
        aiResponse = `📜 **Professional Overview of ISO (International Organization for Standardization)**\n\nISO is an independent, non-governmental international organization based in Geneva, Switzerland. It develops globally recognized standards for quality, safety, security, environmental protection, and operational efficiency.\n\n### Key ISO Standards for Businesses:\n• **ISO 9001:2015**: Quality Management System (QMS) - Standard for tenders & vendor onboarding.\n• **ISO 14001:2015**: Environmental Management System (EMS) - Standard for pollution compliance & ESG.\n• **ISO 45001:2018**: Occupational Health & Safety (OH&S) - Standard for worker safety & Factory Act compliance.\n• **ISO 27001:2022**: Information Security (ISMS) - Standard for IT companies & data protection.\n• **ISO 22000:2018**: Food Safety (FSMS) - Standard for food processors & exporters.\n• **ISO 50001:2018**: Energy Management (EnMS) - Standard for slacking factory power bills.\n\n👉 **Which industry or product does your company operate in?** Tell me your business type, and I will recommend the exact ISO standard that will bring you the highest business value.`;
        quickReplies = ['Recommend for my business', 'ISO 9001 QMS', 'ISO 27001 ISMS', 'ISO 22000 Food Safety'];
      }

      // SCENARIO 5: ZED QUERY ("What is ZED?")
      else if (
        msgLower === 'what is zed' || msgLower === 'what is zed?' || msgLower.includes('explain zed') || (msgLower.includes('what is zed') && !msgLower.includes('iso'))
      ) {
        detectedService = 'ZED Scheme Overview';
        aiResponse = buildGuideAnswer('zed');
        quickReplies = ['ZED Subsidy Application', 'ZED Documents', 'ISO vs ZED', 'Book Free Consultation'];
      }

      // COMPARISON ENGINE (Checked first so comparison queries match formatted matrices)
      else if (msgLower.includes('iso vs zed') || msgLower.includes('zed vs iso') || msgLower.includes('difference between iso and zed')) {
        detectedService = 'Comparison: ISO vs ZED';
        aiResponse = buildComparisonTable('iso_vs_zed');
        quickReplies = ['ZED MSME Subsidy', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('iso vs iatf') || msgLower.includes('iatf vs iso')) {
        detectedService = 'Comparison: ISO vs IATF';
        aiResponse = buildComparisonTable('iso_vs_iatf');
        quickReplies = ['IATF 16949 Roadmap', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('9001 vs 13485') || msgLower.includes('13485 vs 9001') || (msgLower.includes('medical') && msgLower.includes('iso 9001'))) {
        detectedService = 'Comparison: ISO 9001 vs ISO 13485';
        aiResponse = buildComparisonTable('iso_9001_vs_13485');
        quickReplies = ['ISO 13485 Quote', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('9001 vs 17025') || msgLower.includes('17025 vs 9001') || (msgLower.includes('lab') && msgLower.includes('iso 9001'))) {
        detectedService = 'Comparison: ISO 9001 vs ISO 17025';
        aiResponse = buildComparisonTable('iso_9001_vs_17025');
        quickReplies = ['NABL Audit Prep', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('5s vs kaizen') || msgLower.includes('lean vs 5s') || msgLower.includes('kaizen vs lean')) {
        detectedService = 'Comparison: 5S vs Kaizen vs Lean';
        aiResponse = buildComparisonTable('lean_vs_5s_kaizen');
        quickReplies = ['5S Workshop', 'Lean Transformation', 'Book Free Consultation'];
      }
      else if (msgLower.includes('corporate vs industrial') || msgLower.includes('training comparison')) {
        detectedService = 'Comparison: Training Programs';
        aiResponse = buildComparisonTable('corporate_vs_industrial_training');
        quickReplies = ['Core Tools Workshop', 'Placement Prep', 'Book Free Consultation'];
      }
      else if (msgLower.includes('nats vs naps') || msgLower.includes('naps vs nats')) {
        detectedService = 'Comparison: NATS vs NAPS';
        aiResponse = buildComparisonTable('nats_vs_naps');
        quickReplies = ['NATS Scheme Info', 'NAPS Process', 'Book Free Consultation'];
      }
      else if (msgLower.includes('sedex vs social') || msgLower.includes('social vs sedex')) {
        detectedService = 'Comparison: SEDEX vs Social Audit';
        aiResponse = buildComparisonTable('sedex_vs_social_audit');
        quickReplies = ['SEDEX SMETA Audit', 'Social Audit Info', 'Book Free Consultation'];
      }
      else if (msgLower.includes('fssai vs iso') || msgLower.includes('iso vs fssai')) {
        detectedService = 'Comparison: FSSAI vs ISO 22000';
        aiResponse = buildComparisonTable('fssai_vs_iso_22000');
        quickReplies = ['FSSAI License Quote', 'ISO 22000 FSMS', 'Book Free Consultation'];
      }

      // TOPIC 1: ISO 9001
      else if (msgLower.includes('9001') || (msgLower.includes('iso') && (msgLower.includes('quality') || msgLower.includes('qms')))) {
        detectedService = 'ISO 9001 QMS';
        aiResponse = buildGuideAnswer('iso_9001');
        quickReplies = ['Get ISO 9001 Quote', 'ISO vs ZED', 'ISO 14001 EMS', 'Book Free Consultation'];
      }
      // TOPIC 2: ISO 14001
      else if (msgLower.includes('14001') || (msgLower.includes('environment') && msgLower.includes('iso'))) {
        detectedService = 'ISO 14001 EMS';
        aiResponse = buildGuideAnswer('iso_14001');
        quickReplies = ['Pollution Board NOC', 'ISO 45001 OH&S', 'Book Free Consultation'];
      }
      // TOPIC 3: ISO 45001
      else if (msgLower.includes('45001') || (msgLower.includes('health') && msgLower.includes('safety'))) {
        detectedService = 'ISO 45001 OH&S';
        aiResponse = buildGuideAnswer('iso_45001');
        quickReplies = ['ISO 45001 Process', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      // TOPIC 4: ISO 22000
      else if (msgLower.includes('22000') || (msgLower.includes('food safety') && msgLower.includes('iso'))) {
        detectedService = 'ISO 22000 FSMS';
        aiResponse = buildGuideAnswer('iso_22000');
        quickReplies = ['FSSAI License Info', 'FSSAI vs ISO 22000', 'Book Free Consultation'];
      }
      // TOPIC 5: ISO 27001
      else if (msgLower.includes('27001') || msgLower.includes('isms') || msgLower.includes('cyber') || msgLower.includes('information security')) {
        detectedService = 'ISO 27001 ISMS';
        aiResponse = buildGuideAnswer('iso_27001');
        quickReplies = ['ISO 27001 ISMS Quote', 'SOC 2 Audit Prep', 'Book Free Consultation'];
      }
      // TOPIC 6: ISO 22301
      else if (msgLower.includes('22301') || msgLower.includes('business continuity') || msgLower.includes('bcms')) {
        detectedService = 'ISO 22301 BCMS';
        aiResponse = buildGuideAnswer('iso_22301');
        quickReplies = ['ISO 22301 Info', 'ISO 27001 ISMS', 'Book Free Consultation'];
      }
      // TOPIC 7: ISO 50001
      else if (msgLower.includes('50001') || msgLower.includes('energy management') || msgLower.includes('enms')) {
        detectedService = 'ISO 50001 EnMS';
        aiResponse = buildGuideAnswer('iso_50001');
        quickReplies = ['ISO 50001 Info', 'Profit Maximization', 'Book Free Consultation'];
      }
      // TOPIC 8: ISO 13485 (Medical Devices)
      else if (msgLower.includes('13485') || msgLower.includes('medical device') || msgLower.includes('surgical') || msgLower.includes('cdsco')) {
        detectedService = 'ISO 13485 Medical QMS';
        aiResponse = buildGuideAnswer('iso_13485');
        quickReplies = ['ISO 13485 Quote', 'ISO 9001 vs 13485', 'Book Free Consultation'];
      }
      // TOPIC 9: ISO 17025 (Testing & Calibration Lab / NABL)
      else if (msgLower.includes('17025') || msgLower.includes('nabl') || msgLower.includes('calibration lab') || msgLower.includes('testing lab')) {
        detectedService = 'ISO 17025 NABL Accreditation';
        aiResponse = buildGuideAnswer('iso_17025');
        quickReplies = ['NABL Audit Prep', 'ISO 9001 vs 17025', 'Book Free Consultation'];
      }
      // TOPIC 10: IATF 16949
      else if (msgLower.includes('iatf') || msgLower.includes('16949') || msgLower.includes('apqp') || msgLower.includes('ppap') || msgLower.includes('fmea') || msgLower.includes('core tools')) {
        detectedService = 'IATF 16949 Automotive';
        aiResponse = buildGuideAnswer('iatf');
        quickReplies = ['Core Tools Workshop', 'ISO vs IATF', 'MACE Audit Prep', 'Book Free Consultation'];
      }
      // TOPIC 11: FSSAI
      else if (msgLower.includes('fssai') || msgLower.includes('food license') || msgLower.includes('foscos')) {
        detectedService = 'FSSAI License';
        aiResponse = buildGuideAnswer('fssai');
        quickReplies = ['FSSAI License Quote', 'FSSAI vs ISO 22000', 'Book Free Consultation'];
      }
      // TOPIC 12: SEDEX / SMETA
      else if (msgLower.includes('sedex') || msgLower.includes('smeta')) {
        detectedService = 'SEDEX SMETA Audit';
        aiResponse = buildGuideAnswer('sedex');
        quickReplies = ['SEDEX SMETA Audit', 'SEDEX vs Social Audit', 'Book Free Consultation'];
      }
      // TOPIC 13: MACE AUDIT
      else if (msgLower.includes('mace') || msgLower.includes('maruti suzuki')) {
        detectedService = 'MACE Audit';
        aiResponse = buildGuideAnswer('mace');
        quickReplies = ['MACE Audit Prep', 'IATF 16949 Roadmap', 'Book Free Consultation'];
      }
      // TOPIC 14: SOCIAL AUDIT
      else if (msgLower.includes('social audit') || msgLower.includes('sa 8000') || msgLower.includes('sa8000') || msgLower.includes('bsci') || msgLower.includes('ecovadis')) {
        detectedService = 'Social Audit';
        aiResponse = buildGuideAnswer('social_audit');
        quickReplies = ['Social Audit Info', 'SEDEX vs Social Audit', 'Book Free Consultation'];
      }
      // TOPIC 15: LEAN MANUFACTURING
      else if (msgLower.includes('lean') || msgLower.includes('vsm') || msgLower.includes('value stream') || msgLower.includes('smed')) {
        detectedService = 'Lean Manufacturing';
        aiResponse = buildGuideAnswer('lean_manufacturing');
        quickReplies = ['Lean Transformation', '5S vs Kaizen vs Lean', 'Book Free Consultation'];
      }
      // TOPIC 16: 5S WORKPLACE
      else if (msgLower.includes('5s') || msgLower.includes('seiri') || msgLower.includes('shadow board')) {
        detectedService = '5S Workplace Management';
        aiResponse = buildGuideAnswer('five_s');
        quickReplies = ['5S Workshop', '5S vs Kaizen vs Lean', 'Book Free Consultation'];
      }
      // TOPIC 17: KAIZEN
      else if (msgLower.includes('kaizen') || msgLower.includes('gemba') || msgLower.includes('continuous improvement')) {
        detectedService = 'Kaizen Improvement';
        aiResponse = buildGuideAnswer('kaizen');
        quickReplies = ['Kaizen Event', '5S vs Kaizen vs Lean', 'Book Free Consultation'];
      }
      // TOPIC 18: NATS
      else if (msgLower.includes('nats') || msgLower.includes('national apprenticeship training')) {
        detectedService = 'NATS Scheme';
        aiResponse = buildGuideAnswer('nats');
        quickReplies = ['NATS Registration', 'NATS vs NAPS', 'Book Free Consultation'];
      }
      // TOPIC 19: NAPS
      else if (msgLower.includes('naps') || msgLower.includes('national apprenticeship promotion')) {
        detectedService = 'NAPS Scheme';
        aiResponse = buildGuideAnswer('naps');
        quickReplies = ['NAPS Process', 'NATS vs NAPS', 'Book Free Consultation'];
      }
      // TOPIC 20: PLACEMENT PREPARATION
      else if (msgLower.includes('placement') || msgLower.includes('campus') || msgLower.includes('mock interview') || msgLower.includes('gd prep')) {
        detectedService = 'Placement Preparation';
        aiResponse = buildGuideAnswer('placement_prep');
        quickReplies = ['Campus Bootcamp', 'Training Comparison', 'Book Free Consultation'];
      }
      // TOPIC 21: FUTURE GUIDANCE
      else if (msgLower.includes('future guidance') || msgLower.includes('career guidance') || msgLower.includes('career roadmap') || msgLower.includes('lead auditor course')) {
        detectedService = 'Future Career Guidance';
        aiResponse = buildGuideAnswer('future_guidance');
        quickReplies = ['1-on-1 Mentorship', 'ISO Lead Auditor Info', 'Book Free Consultation'];
      }
      // TOPIC 22: TRAINING
      else if (msgLower.includes('training') || msgLower.includes('workshop') || msgLower.includes('seminar')) {
        detectedService = 'Industrial Training';
        aiResponse = buildGuideAnswer('training');
        quickReplies = ['Core Tools Workshop', '5S Kaizen Workshop', 'Placement Prep', 'Book Free Consultation'];
      }
      // TOPIC 23: PROFIT MAXIMIZATION
      else if (msgLower.includes('profit') || msgLower.includes('cost reduction') || msgLower.includes('yield') || msgLower.includes('oee')) {
        detectedService = 'Profit Maximization';
        aiResponse = buildGuideAnswer('profit_maximization');
        quickReplies = ['Profit Maximization Blueprint', '5S Kaizen Info', 'Book Free Consultation'];
      }
      // TOPIC 24: LEADERSHIP
      else if (msgLower.includes('leadership') || msgLower.includes('supervisor') || msgLower.includes('managerial')) {
        detectedService = 'Leadership Program';
        aiResponse = buildGuideAnswer('leadership');
        quickReplies = ['Leadership Workshop', 'Master Business Program', 'Book Free Consultation'];
      }
      // TOPIC 25: MASTER BUSINESS EXCELLENCE PROGRAM
      else if (msgLower.includes('master program') || msgLower.includes('master business') || msgLower.includes('transformation')) {
        detectedService = 'Master Business Excellence Program';
        aiResponse = buildGuideAnswer('master_business_excellence');
        quickReplies = ['Book Free Consultation', 'ZED MSME Subsidy', 'ISO 9001 QMS', 'WhatsApp Support'];
      }

      // COST / PRICE QUERY
      else if (msgLower.includes('cost') || msgLower.includes('price') || msgLower.includes('fee') || msgLower.includes('kharcha') || msgLower.includes('rate')) {
        detectedService = 'Pricing Policy';
        aiResponse = `💰 **PRV Consultancy Investment & Financial Policy**\n\nInvestment for enterprise consultancy and certification depends on:\n1️⃣ **Plant Scope & Locations**: Single vs multi-unit manufacturing facilities.\n2️⃣ **Workforce Size**: Total employee headcount and shopfloor shifts.\n3️⃣ **Certification Standard**: ISO 9001, IATF 16949, ZED, SEDEX, etc.\n4️⃣ **Government Subsidies & Grants**:\n   - **ZED MSME Scheme**: Up to **80% Government Subsidy** on audit fees + **₹10,000 Handholding Grant** + **0.5% lower loan interest**.\n   - **NATS / NAPS**: Central Govt stipend reimbursement up to **₹1,500/month per candidate** + 100% PF/ESI exemption.\n\n⚠️ *Disclaimer*: PRV does not charge arbitrary rates. We provide milestone-based pricing and maximize government financial subsidy claims for your business.\n\n👉 **To receive a formal customized proposal**: Please share your Name, Company, Mobile Number, Email, and City in chat!`;
        quickReplies = ['Book Free Consultation', 'ZED Subsidy Info', 'ISO 9001 Quote', 'WhatsApp Support'];
      }

      // TIMELINE QUERY
      else if (msgLower.includes('timeline') || msgLower.includes('duration') || msgLower.includes('how long') || msgLower.includes('kitna time')) {
        detectedService = 'Timeline Overview';
        aiResponse = `⏱️ **Certification & Project Timelines**\n\n• **ISO 9001 / 14001 / 45001**: 10 to 20 business days.\n• **ZED MSME Subsidy Certification**: 2 to 4 weeks.\n• **IATF 16949 & Core Tools**: 2 to 3 months.\n• **SEDEX SMETA / Social Audits**: 1 to 3 weeks.\n• **FSSAI License Approval**: 7 to 15 days.\n• **NATS / NAPS Onboarding**: 1 to 2 weeks.\n\n*Durations are guaranteed under PRV fast-track consulting project management.*`;
        quickReplies = ['ISO 9001 Process', 'ZED MSME Subsidy', 'Book Free Consultation'];
      }

      // DOCUMENTS QUERY
      else if (msgLower.includes('documents') || msgLower.includes('kagaz') || msgLower.includes('document required')) {
        detectedService = 'Document Checklists';
        aiResponse = `📄 **Master Document Checklist for Certification & Audits**\n\nGenerally required records include:\n1️⃣ **Legal Entity Proof**: Udyam Registration Certificate / GST Certificate / PAN Card\n2️⃣ **Premises Proof**: Electricity bill, Factory lease agreement, or Land ownership deed\n3️⃣ **Operational SOPs**: Process Flowchart, Quality Policy & Organization Chart\n4️⃣ **Safety/Quality Logs**: Calibration records, Water/Pollution NOC logs (where applicable)\n\n👉 Which specific certification (ISO 9001, ZED, FSSAI, IATF) do you need the exact document checklist for?`;
        quickReplies = ['ISO 9001 Docs', 'ZED Subsidy Docs', 'FSSAI License Docs', 'IATF Docs'];
      }

      // GREETINGS & HINDI / MULTILINGUAL
      else if (userLang === 'hindi' || msgLower.includes('namaste') || msgLower.includes('hindi')) {
        detectedService = 'Multilingual Hindi';
        aiResponse = `🙏 **नमस्ते! मैं PRV AI Business Consultant हूँ।**\n\nमैं आपकी व्यावसायिक आवश्यकताओं (ISO सर्टिफिकेशन, ZED सरकारी सब्सिडी, IATF 16949, FSSAI, SEDEX, NATS) का समाधान प्रदान करूँगा।\n\nआप अपने व्यवसाय की जानकारी साझा करें, और मैं आपको सर्वोत्तम समाधान की सलाह दूंगा!`;
        quickReplies = ['ZED Subsidy', 'ISO 9001 Info', 'FSSAI License', 'Book Free Consultation'];
      }

      // GENERAL DEFAULT CONSULTANT RESPONSE
      else {
        detectedService = 'General Assistance';
        aiResponse = `🏢 **Welcome to PRV Consultancy Services - Enterprise AI Consulting**\n\nI am your **PRV Senior AI Business Consultant**. I can assist you with:\n\n1️⃣ **ISO Certifications**: ISO 9001, 14001, 45001, 27001, 22000, 22301, 50001\n2️⃣ **Government Schemes**: ZED (80% Subsidy), NATS, NAPS, Udyam, GeM\n3️⃣ **Automotive & Core Tools**: IATF 16949, APQP, PPAP, FMEA, MSA, SPC, MACE Audit\n4️⃣ **Ethical & Social Compliance**: SEDEX SMETA (2/4 Pillar), SA 8000\n5️⃣ **Operational Excellence**: 5S, Lean, Kaizen, Profit Maximization\n\nPlease tell me about your company's industry or goal, and I will recommend the best solution for your business!`;
        quickReplies = ['Which certificate do I need?', 'ZED MSME Subsidy', 'ISO 9001 QMS', 'Book Free Consultation'];
      }

      // ENFORCE MANDATORY CLOSING FOR EVERY RESPONSE
      aiResponse = enforceClosing(aiResponse);

      if (leadCaptured) {
        aiResponse += `\n\n✅ **Success**: Your contact info has been recorded in PRV CRM! A senior consultant will reach out to you shortly.`;
      }

      // Save conversation entry to SQLite DB
      try {
        const stmt = db.prepare(`
          INSERT INTO ai_conversations (session_id, user_message, ai_response, detected_service, lead_captured)
          VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(sessionId, userMessage, aiResponse, detectedService, leadCaptured);
      } catch (errDb) {
        console.error('Error saving AI conversation:', errDb);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        response: aiResponse,
        detectedService,
        quickReplies,
        leadCaptured,
        actionType,
        sessionId,
        detectedLanguage: userLang
      }));
    } catch (err) {
      console.error('Error in /api/ai/chat:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'AI processing error.' }));
    }
    return;
  }

  // GET /api/ai/logs - Fetch AI Chat History for CRM Admin Dashboard
  if (pathname === '/api/ai/logs' && method === 'GET') {
    try {
      const stmt = db.prepare(`SELECT * FROM ai_conversations ORDER BY created_at DESC LIMIT 100`);
      const rows = stmt.all();

      const totalChats = db.prepare('SELECT COUNT(*) as c FROM ai_conversations').get().c;
      const leadsFromAi = db.prepare('SELECT COUNT(*) as c FROM ai_conversations WHERE lead_captured = 1').get().c;
      
      const topTopics = db.prepare(`
        SELECT detected_service as service, COUNT(*) as count 
        FROM ai_conversations 
        GROUP BY detected_service 
        ORDER BY count DESC 
        LIMIT 5
      `).all();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        stats: { totalChats, leadsFromAi },
        topTopics,
        data: rows
      }));
    } catch (err) {
      console.error('Error fetching AI logs:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error fetching AI logs.' }));
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
