/* ==========================================================================
   PRV CONSULTANCY SERVICES - MASTER BACKEND SERVER
   Built-in Node.js SQLite Database Architecture & REST API Endpoints
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const intentEngine = require('./prv-ai/intent-engine');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const DB_PATH = path.join(__dirname, 'prv_consultancy.db');
const KB_PATH = path.join(__dirname, 'knowledge', 'prv_knowledge_base.json');
const PRV_AI_DIR = path.join(__dirname, 'prv-ai');

// Load Knowledge Base & PRV-AI Datasets
let knowledgeBase = { company: {}, guides: {}, comparisons: {} };
let prvAiKb = { services: [] };
let prvAiFaqs = { faqs: [] };
let prvAiObjections = { objections: [] };
let prvAiLeads = { lead_qualification_rules: {} };

try {
  if (fs.existsSync(KB_PATH)) {
    knowledgeBase = JSON.parse(fs.readFileSync(KB_PATH, 'utf-8'));
    console.log('PRV Knowledge Base loaded successfully.');
  }
} catch (kbErr) {
  console.warn('Warning: Could not load prv_knowledge_base.json:', kbErr.message);
}

try {
  const kbFile = path.join(PRV_AI_DIR, 'knowledge-base.json');
  const faqFile = path.join(PRV_AI_DIR, 'faq-dataset.json');
  const objFile = path.join(PRV_AI_DIR, 'objection-handling.json');
  const leadFile = path.join(PRV_AI_DIR, 'lead-qualification.json');

  if (fs.existsSync(kbFile)) prvAiKb = JSON.parse(fs.readFileSync(kbFile, 'utf-8'));
  if (fs.existsSync(faqFile)) prvAiFaqs = JSON.parse(fs.readFileSync(faqFile, 'utf-8'));
  if (fs.existsSync(objFile)) prvAiObjections = JSON.parse(fs.readFileSync(objFile, 'utf-8'));
  if (fs.existsSync(leadFile)) prvAiLeads = JSON.parse(fs.readFileSync(leadFile, 'utf-8'));

  console.log(`PRV-AI Knowledge Engine loaded: ${prvAiKb.services ? prvAiKb.services.length : 0} services, ${prvAiFaqs.faqs ? prvAiFaqs.faqs.length : 0} FAQs, ${prvAiObjections.objections ? prvAiObjections.objections.length : 0} objection frameworks.`);
} catch (prvAiErr) {
  console.warn('Warning: Could not load prv-ai dataset files:', prvAiErr.message);
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
    detected_intent TEXT DEFAULT 'GENERAL_QUERY',
    language TEXT DEFAULT 'en',
    lead_score INTEGER DEFAULT 0,
    lead_captured INTEGER DEFAULT 0
  );
`);
try { db.exec(`ALTER TABLE ai_conversations ADD COLUMN detected_intent TEXT DEFAULT 'GENERAL_QUERY';`); } catch (e) {}
try { db.exec(`ALTER TABLE ai_conversations ADD COLUMN language TEXT DEFAULT 'en';`); } catch (e) {}
try { db.exec(`ALTER TABLE ai_conversations ADD COLUMN lead_score INTEGER DEFAULT 0;`); } catch (e) {}


// Approved question-and-answer pairs supplied by the PRV team.  These are
// checked before the built-in rules so the assistant can be trained without a
// code deployment.
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_training_examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT DEFAULT '',
    active INTEGER DEFAULT 1
  );
`);

// Create Table 4: appointments
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    full_name TEXT NOT NULL,
    company_name TEXT,
    mobile_number TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT,
    industry TEXT,
    service_required TEXT NOT NULL,
    preferred_date TEXT,
    preferred_time TEXT,
    status TEXT DEFAULT 'Scheduled',
    consultant TEXT DEFAULT 'Unassigned',
    notes TEXT
  );
`);

console.log('PRV Consultancy Databases (client_enquiries, seminar_registrations, ai_conversations & appointments) initialized successfully.');

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

  // GET /api/prv-ai/knowledge - Get full PRV AI Knowledge Base & Datasets
  if (pathname === '/api/prv-ai/knowledge' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      knowledge_base: prvAiKb,
      faqs: prvAiFaqs,
      objections: prvAiObjections,
      lead_rules: prvAiLeads
    }));
    return;
  }

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

  // GET /api/ai/training - list approved training examples for the admin.
  if (pathname === '/api/ai/training' && method === 'GET') {
    const rows = db.prepare('SELECT * FROM ai_training_examples ORDER BY created_at DESC').all();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: rows }));
    return;
  }

  // POST /api/ai/training - add a verified answer the assistant can use.
  if (pathname === '/api/ai/training' && method === 'POST') {
    try {
      const { question, answer, keywords = '' } = await parseJsonBody(req);
      if (!question || !answer) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Question and answer are required.' }));
        return;
      }
      const result = db.prepare('INSERT INTO ai_training_examples (question, answer, keywords) VALUES (?, ?, ?)')
        .run(question.trim(), answer.trim(), keywords.trim());
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: Number(result.lastInsertRowid) }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Could not save the training example.' }));
    }
    return;
  }

  // DELETE /api/ai/training/:id - remove an approved answer.
  const trainingDeleteMatch = pathname.match(/^\/api\/ai\/training\/(\d+)$/);
  if (trainingDeleteMatch && method === 'DELETE') {
    db.prepare('DELETE FROM ai_training_examples WHERE id = ?').run(Number(trainingDeleteMatch[1]));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

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

      // Save to appointments table as well
      try {
        const apptStmt = db.prepare(`
          INSERT INTO appointments (full_name, company_name, mobile_number, email, industry, service_required, preferred_date, preferred_time, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        apptStmt.run(full_name, company_name || '', mobile_number, email || '', industry || 'General', service_required || 'FREE Consultation', preferred_date || '', preferred_time || '', notes || '');
      } catch (eAppt) {
        console.error('Error logging appointment:', eAppt);
      }

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

  // GET /api/appointments - Retrieve Scheduled Appointments
  if (pathname === '/api/appointments' && method === 'GET') {
    try {
      const rows = db.prepare(`SELECT * FROM appointments ORDER BY created_at DESC`).all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: rows.length, data: rows }));
    } catch (err) {
      console.error('Error fetching appointments:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error fetching appointments.' }));
    }
    return;
  }

  // POST /api/chat & POST /api/ai/chat - Process AI Assistant Query
  if ((pathname === '/api/chat' || pathname === '/api/ai/chat') && method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const userMessage = (data.message || data.userMessage || data.text || '').trim();
      const sessionId = data.conversationId || data.sessionId || 'session_' + Date.now();
      let inputLang = (data.language || '').trim();

      if (!userMessage) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Message content is required.' }));
        return;
      }

      // Session & Conversation Memory Store
      global.conversationMemory = global.conversationMemory || {};
      if (!global.conversationMemory[sessionId]) {
        global.conversationMemory[sessionId] = {
          history: [],
          industry: null,
          business: null,
          product: null
        };
      }
      const sessionData = global.conversationMemory[sessionId];

      // Auto-detect Language if not explicitly provided
      function detectLanguage(text) {
        if (inputLang && ['en', 'hi', 'hinglish'].includes(inputLang.toLowerCase())) {
          return inputLang.toLowerCase();
        }
        const txt = text.toLowerCase();
        if (/[\u0900-\u097F]/.test(text) || txt.includes('hindi me') || txt.includes('हिंदी में')) {
          return 'hi';
        }
        const hinglishKeywords = ['kya', 'kaise', 'hai', 'hain', 'batao', 'chahiye', 'kitna', 'lagta', 'kare', 'kaun', 'mujhko', 'mujhe', 'aapka', 'hoga', 'baare', 'samjhao', 'meri', 'mera', 'factory'];
        const words = txt.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
        const matchCount = words.filter(w => hinglishKeywords.includes(w)).length;
        if (matchCount >= 1) return 'hinglish';
        return 'en';
      }

      const userLang = detectLanguage(userMessage);
      const msgLower = userMessage.toLowerCase();

      // Extract Context into Memory (e.g. Industry, Manufacturing)
      if (msgLower.includes('auto part') || msgLower.includes('automotive') || msgLower.includes('car part') || msgLower.includes('automobile')) {
        sessionData.industry = 'Automobile';
        sessionData.product = 'Automobile Parts';
      } else if (msgLower.includes('food') || msgLower.includes('beverage') || msgLower.includes('restaurant')) {
        sessionData.industry = 'Food Processing';
      } else if (msgLower.includes('textile') || msgLower.includes('garment')) {
        sessionData.industry = 'Textile';
      } else if (msgLower.includes('software') || msgLower.includes('it company') || msgLower.includes('tech')) {
        sessionData.industry = 'IT & Technology';
      }

      // Logging Requirement #6
      console.log(`\n=================== [AI CHAT REQUEST RECEIVED] ===================`);
      console.log(`[REQUEST RECEIVED] Session: ${sessionId} | Lang: ${userLang}`);
      console.log(`[USER MESSAGE] "${userMessage}"`);

      // Intent & Service Detection using PRV AI Intent Engine
      let detectedIntent = 'GENERAL_BUSINESS_QUERY';
      let detectedService = 'PRV Consultancy Services';
      let quickReplies = [];
      let leadCaptured = 0;
      let aiResponse = '';
      let retrievedKnowledge = '';

      // ── STEP 1: Check SQLite trained examples first (highest priority) ──
      const normaliseTerms = (val) => [...new Set(String(val).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length >= 2 && !['what', 'which', 'with', 'about', 'your', 'have', 'need', 'please', 'the', 'and', 'for', 'you'].includes(t)))];
      const messageTerms = normaliseTerms(userMessage);
      const trainedExamples = db.prepare('SELECT * FROM ai_training_examples WHERE active = 1').all();
      let trainedMatch = null;
      let trainedScore = 0;

      trainedExamples.forEach(ex => {
        const exTerms = normaliseTerms(`${ex.question} ${ex.keywords || ''}`);
        const overlap = messageTerms.filter(t => exTerms.includes(t)).length;
        const score = overlap / Math.max(1, Math.min(messageTerms.length, exTerms.length));
        if (overlap >= 2 && score > trainedScore) {
          trainedScore = score;
          trainedMatch = ex;
        }
      });

      if (trainedMatch) {
        detectedIntent = 'TRAINED_EXAMPLE';
        detectedService = 'Trained Database Answer';
        retrievedKnowledge = trainedMatch.answer;
        aiResponse = trainedMatch.answer;
        quickReplies = ['Ask another question', 'Book Free Consultation', 'WhatsApp Support'];
      } else {
        // ── STEP 2: PRV AI Intent Engine — covers 20 services × 14 intents ──
        const engineResult = intentEngine.generateResponse(userMessage, sessionId, inputLang, sessionData);
        detectedIntent   = engineResult.intent  || 'UNKNOWN';
        detectedService  = engineResult.service || 'General';
        aiResponse       = engineResult.answer  || '';
        quickReplies     = engineResult.quickReplies || [];
        leadCaptured     = engineResult.leadCaptured || 0;
        retrievedKnowledge = aiResponse.slice(0, 200);
      }

      // Check external AI model API if key exists in env (Requirement #4)
      const aiApiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
      let aiProvider = 'PRV RAG Knowledge Engine';

      if (aiApiKey && process.env.GEMINI_API_KEY) {
        try {
          aiProvider = 'Google Gemini LLM';
          console.log(`[AI REQUEST SENT] Provider: ${aiProvider}`);
          
          const https = require('https');
          const geminiPrompt = {
            contents: [{
              parts: [{
                text: `You are the PRV AI Business Consultant. Answer strictly based on verified facts. Never invent prices or fake guarantees. Return response in ${userLang}.\n\nUser Question: "${userMessage}"\nRetrieved Context: ${retrievedKnowledge}`
              }]
            }]
          };
          
          const postData = JSON.stringify(geminiPrompt);
          const geminiRes = await new Promise((resolve, reject) => {
            const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
            }, res => {
              let body = '';
              res.on('data', chunk => body += chunk);
              res.on('end', () => resolve(body));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
          });

          const geminiJson = JSON.parse(geminiRes);
          if (geminiJson.candidates && geminiJson.candidates[0] && geminiJson.candidates[0].content) {
            aiResponse = geminiJson.candidates[0].content.parts[0].text;
            console.log(`[AI RESPONSE RECEIVED] Chars: ${aiResponse.length}`);
          }
        } catch (eG) {
          console.warn('[AI REQUEST WARN] External LLM call error, using RAG Engine:', eG.message);
        }
      }

      // Logging Requirement #6 Output
      console.log(`[INTENT DETECTED] Intent: ${detectedIntent}`);
      console.log(`[SERVICE DETECTED] Service: ${detectedService}`);
      console.log(`[KNOWLEDGE SEARCH] Query: "${userMessage}" -> Retrieved: ${retrievedKnowledge.length} chars`);
      console.log(`[AI REQUEST SENT] Source: ${aiProvider}`);
      console.log(`[RESPONSE RETURNED] Status: 200 OK | Answer Chars: ${aiResponse.length}`);
      console.log(`===================================================================\n`);

      // Store message in session memory
      sessionData.history.push({ role: 'user', text: userMessage });
      sessionData.history.push({ role: 'assistant', text: aiResponse });

      // Save to SQLite Database
      try {
        const stmt = db.prepare(`
          INSERT INTO ai_conversations (session_id, user_message, ai_response, detected_service, detected_intent, language, lead_captured)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(sessionId, userMessage, aiResponse, detectedService, detectedIntent, userLang, leadCaptured);
      } catch (errDb) {
        console.error('Error saving AI conversation in database:', errDb);
      }

      // Return Structured JSON Response matching all expectations
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        answer: aiResponse,
        response: aiResponse,
        reply: aiResponse,
        intent: detectedIntent,
        service: detectedService,
        language: userLang,
        quickReplies,
        leadCaptured,
        sessionId
      }));
    } catch (err) {
      console.error('[SERVER CHAT ERROR]:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'AI service processing error', message: 'Sorry, I couldn\'t process that request right now. Please try again.' }));
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
