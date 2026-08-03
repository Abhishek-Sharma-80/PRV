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
            `User Chat Inquiry: "${userMessage}"`
          );
          leadCaptured = 1;
        } catch (errLead) {
          console.error('AI Lead capture error:', errLead);
        }
      }

      const costDisclaimer = "\n\n💡 *Note on Pricing*: The cost depends on the size of your organization, number of employees, locations and project scope. Our consultant can provide a customized quotation.";

      // Helper function to build detailed guide answers according to Master Prompt rules
      function buildGuideAnswer(guideKey, serviceName) {
        const g = knowledgeBase.guides[guideKey];
        if (!g) return null;

        let res = `📘 **${g.title || serviceName}**\n\n`;
        if (g.what_it_is) res += `• **What it is**: ${g.what_it_is}\n`;
        if (g.why_needed) res += `• **Why companies need it**: ${g.why_needed}\n`;
        if (g.who_should_apply) res += `• **Who should apply**: ${g.who_should_apply}\n\n`;
        
        if (g.levels_and_subsidies) {
          res += `💰 **Subsidies & Grants**:\n`;
          Object.entries(g.levels_and_subsidies).forEach(([lvl, detail]) => {
            res += `  - **${lvl}**: ${detail}\n`;
          });
          res += `\n`;
        }

        if (g.core_tools && Array.isArray(g.core_tools)) {
          res += `🛠️ **Automotive Core Tools Included**:\n`;
          g.core_tools.forEach(t => res += `  - ${t}\n`);
          res += `\n`;
        }

        if (g.benefits && Array.isArray(g.benefits)) {
          res += `✨ **Key Benefits**:\n`;
          g.benefits.forEach(b => res += `  - ${b}\n`);
          res += `\n`;
        }

        if (g.process && Array.isArray(g.process)) {
          res += `📋 **Process**:\n`;
          g.process.forEach((p, idx) => res += `  ${idx + 1}. ${p}\n`);
          res += `\n`;
        }

        if (g.documents_required && Array.isArray(g.documents_required)) {
          res += `📄 **Documents Required**:\n`;
          g.documents_required.forEach(d => res += `  - ${d}\n`);
          res += `\n`;
        }

        if (g.time_required) res += `⏱️ **Time Required**: ${g.time_required}\n`;
        res += `💵 **Investment**: ${g.cost_note || costDisclaimer}\n\n`;
        if (g.how_prv_helps) res += `🤝 **How PRV Consultancy Helps**: ${g.how_prv_helps}`;
        
        return res;
      }

      // Helper to build comparison tables
      function buildComparisonTable(compKey) {
        const c = knowledgeBase.comparisons[compKey];
        if (!c) return null;

        let res = `📊 **${c.title} - Detailed Comparison Matrix**\n\n`;
        c.table.forEach((row, idx) => {
          if (idx === 0) {
            res += `| ${row[0]} | ${row[1]} | ${row[2]} |\n`;
            res += `| --- | --- | --- |\n`;
          } else {
            res += `| **${row[0]}** | ${row[1]} | ${row[2]} |\n`;
          }
        });
        res += `\n🎯 **PRV Consultant Verdict**: ${c.verdict}`;
        return res;
      }

      // ------------------------------------------------------------------------
      // PRV SYSTEM PROMPT RULES 1-15 ENGINE
      // ------------------------------------------------------------------------

      // ------------------------------------------------------------------------
      // PRV 3-LAYER AI BUSINESS EXCELLENCE ADVISOR ENGINE
      // ------------------------------------------------------------------------

      const offTopicKeywords = ['cricket', 'ipl', 'match', 'movie', 'film', 'actor', 'actress', 'weather', 'politics', 'election', 'song', 'recipe', 'food recipe', 'game', 'football', 'joke', 'python code', 'java code', 'programming', 'who is president', 'who won'];
      const isOffTopic = offTopicKeywords.some(kw => msgLower.includes(kw)) && !msgLower.includes('iso') && !msgLower.includes('zed') && !msgLower.includes('audit');

      // WELCOME ACTION TRIGGER BUTTONS
      if (msgLower.includes('get certified') || msgLower.includes('🏆 get certified')) {
        detectedService = 'Qualification Step 1';
        aiResponse = `🏆 **Let's find the right certification for your organization!**\n\nTo give you the exact recommendation and calculate government subsidies, please select your Industry:\n\n1️⃣ 🏭 Manufacturing & Engineering\n2️⃣ 🚗 Automotive & Components\n3️⃣ 🥗 Food & Beverage\n4️⃣ 💻 IT, Software & SaaS\n5️⃣ 🧵 Textile & Apparel\n6️⃣ 🏥 Healthcare & Pharma\n7️⃣ 📦 MSME / Startup`;
        quickReplies = ['Manufacturing', 'Automobile', 'Food Industry', 'IT Company', 'Textile', 'MSME / Startup'];
      }
      else if (msgLower.includes('audit & compliance') || msgLower.includes('📋 audit & compliance')) {
        detectedService = 'Audit & Compliance';
        aiResponse = `📋 **PRV Audit & Compliance Solutions**:\n\n1️⃣ **SEDEX / SMETA Ethical Audit (2 & 4 Pillar)**: Global export & retail buyer compliance.\n2️⃣ **MACE Audit Prep**: Maruti Suzuki & Tier-1 OEM audit readiness.\n3️⃣ **FSSAI Food Safety Compliance**: Mandatory licensing, FoSTaC & Hygiene SOPs.\n4️⃣ **ISO Internal & Statutory Audits**: ISO 9001, 14001, 45001, 27001.\n\n*Which audit compliance do you need assistance with?*`;
        quickReplies = ['SEDEX SMETA Audit', 'MACE Audit Prep', 'FSSAI License', 'Book Free Consultation'];
      }
      else if (msgLower.includes('improve productivity') || msgLower.includes('📈 improve productivity')) {
        detectedService = 'Productivity Improvement';
        aiResponse = `📈 **PRV Operational Excellence & Productivity Solutions**:\n\n1️⃣ **5S & Shopfloor Organization**: 20-30% shopfloor waste reduction.\n2️⃣ **Lean Kaizen & Capacity Optimization**: Eliminate bottleneck losses & increase throughput.\n3️⃣ **Profit Maximization Blueprint**: Cost reduction & margin enhancement.\n4️⃣ **Master Business Excellence Program**: 11 Excellence Pillars for business transformation.`;
        quickReplies = ['5S Kaizen Workshop', 'Profit Maximization', 'Master Business Program', 'Book Free Consultation'];
      }
      else if (msgLower.includes('reduce costs') || msgLower.includes('💰 reduce costs')) {
        detectedService = 'Cost Reduction & Subsidies';
        aiResponse = `💰 **Financial Incentives & Cost Reduction Roadmap**:\n\n1️⃣ **ZED Scheme**: Claim up to **80% Govt Subsidy** on audit fees + **0.5% lower bank interest rate**.\n2️⃣ **NATS Scheme**: Central Govt stipend reimbursement up to **₹1,500/month per apprentice**.\n3️⃣ **Operational Waste Reduction**: Save lakhs annually through 5S Lean Kaizen.\n\n*Would you like to calculate exact subsidy eligibility for your unit?*`;
        quickReplies = ['Calculate ZED Subsidy', 'NATS Stipend Info', 'Cost Reduction Plan', 'Book Free Consultation'];
      }
      else if (msgLower.includes('industrial training') || msgLower.includes('👨‍🏭 industrial training')) {
        detectedService = 'Training Academy';
        aiResponse = `👨‍🏭 **PRV Industrial & Corporate Training Academy**:\n\n• **Automotive Core Tools**: APQP, PPAP, FMEA (AIAG-VDA), MSA, SPC.\n• **Quality & Shopfloor Mastery**: 5S, Kaizen, Poka-Yoke, 7 QC Tools.\n• **Soft Skills & Leadership**: Supervisor to Leader transformation & managerial skills.\n• **Custom Corporate Workshops**: Tailored for your plant team.`;
        quickReplies = ['Core Tools Workshop', '5S Kaizen Training', 'Leadership Program', 'Book Consultation'];
      }
      else if (msgLower.includes('nats / naps') || msgLower.includes('🎓 nats / naps')) {
        detectedService = 'Apprenticeship Schemes';
        aiResponse = `🎓 **NATS & NAPS Government Apprenticeship Schemes**:\n\n• **NATS (National Apprenticeship Training Scheme)**: For Diploma/Engineering graduates; Govt reimburses up to ₹1,500/month per apprentice stipend.\n• **NAPS (National Apprenticeship Promotion Scheme)**: For ITI & non-technical apprentices.\n• **PRV Handholding**: Portal registration, candidate placement, monthly claim submission.`;
        quickReplies = ['NATS Registration', 'NAPS Process', 'NATS vs NAPS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('book free consultation') || msgLower.includes('📅 book free consultation')) {
        detectedService = 'Consultation Booking';
        actionType = 'qualification_step_lead';
        aiResponse = `📅 **Book Your FREE 15-Minute Strategy Session with Senior PRV Consultant**\n\nPlease share your details below so we can schedule a convenient time slot:\n\n• **Full Name**\n• **Company Name**\n• **Mobile Number**\n• **Work Email**\n• **City & Industry**\n• **Preferred Date & Time**\n\n*Or type your Mobile Number & Email directly in chat!*`;
        quickReplies = ['Download PDF Brochure', 'WhatsApp Support', 'Call +91 74893 51297'];
      }

      // RULE 12: OFF-TOPIC SAFEGUARD
      else if (isOffTopic) {
        detectedService = 'Off-Topic Safeguard';
        aiResponse = `I specialize in PRV Consultancy Services, including certifications, compliance, training, operational excellence, and business improvement. I'd be happy to help with those topics.`;
        quickReplies = ['Which certificate do I need?', 'ZED MSME Subsidy', 'ISO 9001 Process', 'Book Free Consultation'];
      }

      // DISAMBIGUATION RULE FOR GENERIC ISO QUERY ("What is ISO" / "ISO kya hai")
      else if (msgLower === 'what is iso' || msgLower === 'what is iso?' || msgLower === 'iso kya hai' || msgLower === 'iso kya hai?' || msgLower === 'iso' || msgLower.includes('tell me about iso')) {
        detectedService = 'ISO Disambiguation';
        aiResponse = `📜 Main aapki help karta hoon!\n\nKya aap kisi **specific ISO standard** (jaise ISO 9001 Quality, ISO 14001 Environment, ISO 27001 Cybersecurity, ISO 22000 Food Safety) ke baare me jaana chahte hain, ya main aapke business ke hisaab se sahi ISO recommend karun?`;
        quickReplies = ['Recommend for my business', 'ISO 9001 QMS', 'ISO 27001 ISMS', 'ISO 22000 Food Safety'];
      }

      // RULE 6: EXPLAIN ONLY ZED (DO NOT EXPLAIN ISO)
      else if (msgLower === 'what is zed' || msgLower === 'what is zed?' || msgLower.includes('explain zed') || (msgLower.includes('what is zed') && !msgLower.includes('iso'))) {
        detectedService = 'ZED Explanation Only';
        aiResponse = `🏆 **What is ZED (Zero Defect Zero Effect) Scheme?**\n\nZED is an official national certification scheme launched by the Ministry of MSME, Government of India, to encourage MSME manufacturing units to produce high-quality goods with zero defects and zero environmental damage.\n\n💰 **Government Subsidies & Benefits**:\n- **Bronze Level**: 80% Subsidy on Certification cost + ₹10,000 Handholding Grant\n- **Silver Level**: 60% Subsidy + Up to ₹5 Lakhs Capital & Testing Subsidy\n- **Gold Level**: 50% Subsidy + 0.5% Concessional Bank Interest Rate on loans\n\n**Eligibility**: All MSME manufacturing units with a valid Udyam Registration.`;
        quickReplies = ['Apply for ZED Subsidy', 'ZED Documents', 'Book Consultation'];
      }

      // RULE 8: COST QUERY (EXACT WORDING REQUIREMENT)
      else if (msgLower.includes('how much does it cost') || msgLower.includes('what is the cost') || msgLower.includes('price') || msgLower.includes('fee') || msgLower.includes('kharcha') || msgLower.includes('rate') || msgLower.includes('cost of certification')) {
        detectedService = 'Pricing Policy';
        aiResponse = `💰 **PRV Consultancy - Official Pricing Information**\n\nThe cost depends on your company size, number of employees, locations and project scope. Please share your details for an accurate quotation.\n\n✨ **Available Financial Incentives**:\n• **ZED Certification**: Up to 80% Government Subsidy on audit fees.\n• **NATS Scheme**: Central Govt stipend reimbursement up to ₹1,500/month per apprentice.\n• **ISO Certifications**: Milestone-based flexible payment options.\n\nPlease share your **Mobile Number, Email & City** for a customized formal quotation!`;
        quickReplies = ['Book Free Consultation', 'ZED Subsidy Info', 'ISO 9001 Quote', 'WhatsApp Support'];
      }

      // RULE 11: TIMELINE QUERY
      else if (msgLower.includes('how long') || msgLower.includes('duration') || msgLower.includes('timeline') || msgLower.includes('time required') || msgLower.includes('kitna time') || msgLower.includes('kitne din')) {
        detectedService = 'Timeline Information';
        aiResponse = `⏱️ **Certification Timeline & Processing Duration**\n\n• **Standard ISO Certifications (ISO 9001, 14001, 45001)**: Typically completed within **10 to 20 business days**.\n• **ZED Certification (MSME Scheme)**: **2 to 4 weeks** (includes desktop verification & handholding).\n• **IATF 16949 & Automotive Core Tools**: **2 to 3 months** (includes shopfloor implementation & internal audits).\n• **SEDEX SMETA / Social Audits**: **1 to 3 weeks**.\n\n*Note: The exact duration depends on your organization's current readiness, documentation speed, and project scope.*`;
        quickReplies = ['ISO 9001 Process', 'ZED MSME Subsidy', 'Book Free Consultation'];
      }

      // RULE 7: DOCUMENTS REQUIRED ONLY QUERY
      else if (msgLower.includes('what documents') || msgLower.includes('document required') || msgLower.includes('documents needed') || msgLower.includes('kagaz') || msgLower.includes('document list')) {
        detectedService = 'Document Requirements';
        aiResponse = `📄 **Master Documents Required for Certification & Audits**\n\nTo apply for ISO, ZED, or statutory compliance through PRV Consultancy, you will generally need:\n\n1️⃣ **Basic Registration**: Udyam Registration Certificate / GST Certificate / PAN Card\n2️⃣ **Premises Proof**: Electricity bill, Factory lease agreement, or Premises ownership proof\n3️⃣ **Operational Data**: Process Flow Diagram, Organization Chart & Quality Policy\n4️⃣ **Product / Safety Logs**: Equipment calibration list, Safety logs, or Lab test reports (where applicable)\n\n*Which specific certification (ISO 9001, ZED, FSSAI, IATF) do you need the exact document checklist for?*`;
        quickReplies = ['ISO 9001 Docs', 'ZED Subsidy Docs', 'FSSAI License Docs', 'IATF Docs'];
      }

      // RULE 10: COMPARISON TABLE GENERATION (ISO VS ZED)
      else if (msgLower.includes('compare iso and zed') || msgLower.includes('iso vs zed') || msgLower.includes('zed vs iso') || msgLower.includes('difference between iso and zed')) {
        detectedService = 'Comparison: ISO vs ZED';
        aiResponse = buildComparisonTable('iso_vs_zed');
        quickReplies = ['ZED Subsidy Details', 'ISO 9001 Process', 'Book Free Consultation', 'WhatsApp Support'];
      }

      // SMART RECOMMENDATION LOGIC PER SECTOR
      else if (msgLower.includes('food') || msgLower.includes('beverage') || msgLower.includes('restaurant') || msgLower.includes('hotel')) {
        detectedService = 'Food Sector Smart Match';
        aiResponse = `🥗 **PRV Smart Recommendation for Food Businesses**:\n\n1️⃣ **FSSAI License (Basic / State / Central)**: Mandatory statutory food license.\n2️⃣ **ISO 22000:2018 (FSMS)**: Global food safety management standard.\n3️⃣ **HACCP Support**: Hazard analysis critical control points for export buyers.\n4️⃣ **Food Hygiene Training**: Staff sanitation & GMP compliance.\n\n*May I know your City, Email & Phone to send a customized food safety checklist?*`;
        quickReplies = ['FSSAI License Quote', 'ISO 22000 FSMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('automobile') || msgLower.includes('auto component') || msgLower.includes('oem vendor')) {
        detectedService = 'Automobile Smart Match';
        aiResponse = `🚗 **PRV Smart Recommendation for Automotive Manufacturers**:\n\n1️⃣ **IATF 16949:2016**: Mandatory automotive quality standard required by Tier-1 OEMs.\n2️⃣ **Automotive Core Tools Training**: Hands-on mastery of APQP, PPAP, FMEA (AIAG-VDA), MSA & SPC.\n3️⃣ **ISO 9001:2015**: Foundational Quality Management System.\n4️⃣ **Supplier Development & MACE Audit Prep**: Maruti Suzuki & OEM audit readiness.\n\n*Would you like our consultant to share an IATF implementation roadmap?*`;
        quickReplies = ['IATF 16949 Roadmap', 'Core Tools Workshop', 'MACE Audit Prep', 'Book Consultation'];
      }
      else if (msgLower.includes('manufacturing') || msgLower.includes('engineering') || msgLower.includes('factory')) {
        detectedService = 'Manufacturing Smart Match';
        aiResponse = `🏭 **PRV Smart Recommendation for Manufacturing & MSME Units**:\n\n1️⃣ **ZED Certification**: Claim up to **80% Govt Subsidy** + **0.5% Concessional Bank Interest**.\n2️⃣ **ISO 9001:2015 (QMS)**: Mandatory for Govt Tenders & corporate vendor approvals.\n3️⃣ **ISO 14001 & ISO 45001**: EHS Environmental & Shopfloor Safety compliance.\n4️⃣ **5S & Lean Kaizen**: Reduce shopfloor waste by 20-30% and boost net profit.\n\n*May I know your Mobile & Email to calculate your exact ZED subsidy eligibility?*`;
        quickReplies = ['Calculate ZED Subsidy', 'ISO 9001 Quote', '5S Kaizen Info', 'Book Free Consultation'];
      }
      else if (msgLower.includes('it company') || msgLower.includes('software') || msgLower.includes('saas') || msgLower.includes('tech')) {
        detectedService = 'IT Sector Smart Match';
        aiResponse = `💻 **PRV Smart Recommendation for IT & Software Companies**:\n\n1️⃣ **ISO/IEC 27001:2022 (ISMS)**: Gold standard for Information Security & Data Protection.\n2️⃣ **SOC 2 Type I & II Readiness**: Essential for US & European SaaS client contracts.\n3️⃣ **ISO/IEC 20000-1**: IT Service Management System standard.\n4️⃣ **ISO 9001:2015**: Quality assurance for software deliverables & IT client tenders.\n\n*Would you like a customized ISO 27001 audit proposal?*`;
        quickReplies = ['ISO 27001 ISMS Quote', 'SOC 2 Audit Prep', 'Book Consultation'];
      }
      else if (msgLower.includes('textile') || msgLower.includes('apparel') || msgLower.includes('garment export')) {
        detectedService = 'Textile Smart Match';
        aiResponse = `🧵 **PRV Smart Recommendation for Textile & Apparel Exporters**:\n\n1️⃣ **SEDEX / SMETA Audit (2-Pillar & 4-Pillar)**: Ethical & Social audit required by global fashion brands (Zara, Walmart, Disney).\n2️⃣ **OEKO-TEX Support**: Eco-safe & organic textile standards.\n3️⃣ **Social Audit Compliance**: Labour standards, Health & Safety, EHS SOPs.\n\n*Please share your Mobile & Email for a mock SMETA audit checklist!*`;
        quickReplies = ['Prepare for SMETA Audit', 'SEDEX vs Social Audit', 'Book Consultation'];
      }

      // OTHER COMPARISONS
      else if (msgLower.includes('iso vs iatf') || msgLower.includes('iatf vs iso')) {
        detectedService = 'Comparison: ISO vs IATF';
        aiResponse = buildComparisonTable('iso_vs_iatf');
        quickReplies = ['IATF 16949 Guide', 'ISO 9001 Process', 'Book Free Consultation'];
      }
      else if (msgLower.includes('nats vs naps') || msgLower.includes('naps vs nats')) {
        detectedService = 'Comparison: NATS vs NAPS';
        aiResponse = buildComparisonTable('nats_vs_naps');
        quickReplies = ['NATS Scheme Guide', 'NAPS Registration', 'Book Free Consultation'];
      }
      else if (msgLower.includes('sedex vs social') || msgLower.includes('social vs sedex') || msgLower.includes('smeta vs social')) {
        detectedService = 'Comparison: SEDEX vs Social Audit';
        aiResponse = buildComparisonTable('sedex_vs_social_audit');
        quickReplies = ['SEDEX SMETA Guide', 'Social Audit Info', 'Book Consultation'];
      }
      else if (msgLower.includes('fssai vs iso') || msgLower.includes('iso 22000 vs fssai') || msgLower.includes('iso vs fssai')) {
        detectedService = 'Comparison: FSSAI vs ISO 22000';
        aiResponse = buildComparisonTable('fssai_vs_iso_22000');
        quickReplies = ['FSSAI License Info', 'ISO 22000 Guide', 'Book Consultation'];
      }

      // OBJECTION HANDLING
      else if (msgLower.includes('expensive') || msgLower.includes('costly') || msgLower.includes('high price') || msgLower.includes('mehnga') || msgLower.includes('kam karo') || msgLower.includes('discount')) {
        detectedService = 'Objection Handling - ROI';
        aiResponse = `💼 **High Return on Investment (ROI) Guarantee**\n\nWe understand cost is important! Here is how PRV Consultancy ensures certification pays for itself:\n\n1️⃣ **ZED Scheme**: Up to 80% Govt Subsidy on certification cost + 0.5% lower interest rate on bank loans.\n2️⃣ **NATS Scheme**: Reimbursement of up to ₹1,500/month per apprentice stipend from Central Govt.\n3️⃣ **5S & Kaizen**: 20-30% shopfloor waste reduction directly increases your monthly net profits.\n4️⃣ **Tender Eligibility**: ISO 9001 unlocks high-value government tenders.\n\nWould you like our consultant to share a cost-benefit calculation for your plant?`;
        quickReplies = ['Book Free Consultation', 'ZED Subsidy Info', 'WhatsApp Support'];
      }
      else if (msgLower.includes('discuss') || msgLower.includes('pooch kar') || msgLower.includes('think about it') || msgLower.includes('later') || msgLower.includes('baad me')) {
        detectedService = 'Objection Handling - Consultation';
        aiResponse = `👍 Absolutely! Take your time to discuss with your management team.\n\nTo make your decision easier, we offer a **FREE 15-Minute Expert Strategy Session** with zero obligation. Our senior consultant will review your plant requirements and share exact subsidy eligibility.\n\nWould you like to book a convenient time slot?`;
        quickReplies = ['Book Free Consultation', 'Download PDF Brochure', 'WhatsApp Support'];
      }
      else if (msgLower.includes('not interested') || msgLower.includes('nahi chahiye') || msgLower.includes('no need')) {
        detectedService = 'Objection Handling - Future Info';
        aiResponse = `Thank you for letting us know! If you ever need guidance in the future regarding **ISO Certifications, ZED MSME Subsidies, SEDEX Audits, or NATS Apprenticeships**, PRV Consultancy will be glad to support you.\n\nYou can download our **Official Services Brochure PDF** for future reference. Have a great day!`;
        quickReplies = ['Download PDF Brochure', 'All Certificates Directory', 'Contact PRV Team'];
      }

      // KNOWLEDGE BASE SPECIFIC GUIDES
      else if (msgLower.includes('zed') || msgLower.includes('zero defect')) {
        detectedService = 'ZED Certification';
        aiResponse = buildGuideAnswer('zed', 'ZED Certification');
        quickReplies = ['Book Free Consultation', 'ISO vs ZED', 'NATS Scheme', 'WhatsApp Support'];
      }
      else if (msgLower.includes('9001') || (msgLower.includes('iso') && msgLower.includes('quality'))) {
        detectedService = 'ISO 9001 QMS';
        aiResponse = buildGuideAnswer('iso_9001', 'ISO 9001');
        quickReplies = ['Get ISO 9001 Quote', 'ISO 14001 Info', 'ISO vs ZED', 'Book Free Consultation'];
      }
      else if (msgLower.includes('14001') || msgLower.includes('environment')) {
        detectedService = 'ISO 14001 EMS';
        aiResponse = buildGuideAnswer('iso_14001', 'ISO 14001');
        quickReplies = ['ISO 14001 Process', 'Pollution Board NOC', 'ISO 45001 Info', 'Book Consultation'];
      }
      else if (msgLower.includes('45001') || msgLower.includes('safety') || msgLower.includes('health and safety')) {
        detectedService = 'ISO 45001 OH&S';
        aiResponse = buildGuideAnswer('iso_45001', 'ISO 45001');
        quickReplies = ['ISO 45001 Process', 'ISO 9001 Process', 'Book Free Consultation'];
      }
      else if (msgLower.includes('27001') || msgLower.includes('cyber') || msgLower.includes('isms') || msgLower.includes('data protection')) {
        detectedService = 'ISO 27001 ISMS';
        aiResponse = buildGuideAnswer('iso_27001', 'ISO 27001');
        quickReplies = ['ISO 27001 Process', 'SOC 2 Audit Prep', 'Book Free Consultation'];
      }
      else if (msgLower.includes('22000') || msgLower.includes('haccp') || msgLower.includes('food safety')) {
        detectedService = 'ISO 22000 FSMS';
        aiResponse = buildGuideAnswer('iso_22000', 'ISO 22000');
        quickReplies = ['ISO 22000 Process', 'FSSAI License Info', 'FSSAI vs ISO 22000', 'Book Consultation'];
      }
      else if (msgLower.includes('22301') || msgLower.includes('business continuity') || msgLower.includes('bcms')) {
        detectedService = 'ISO 22301 BCMS';
        aiResponse = buildGuideAnswer('iso_22301', 'ISO 22301');
        quickReplies = ['ISO 22301 Info', 'ISO 27001 Info', 'Book Consultation'];
      }
      else if (msgLower.includes('50001') || msgLower.includes('energy management') || msgLower.includes('enms')) {
        detectedService = 'ISO 50001 EnMS';
        aiResponse = buildGuideAnswer('iso_50001', 'ISO 50001');
        quickReplies = ['ISO 50001 Info', 'Profit Maximization', 'Book Consultation'];
      }
      else if (msgLower.includes('13485') || msgLower.includes('medical device')) {
        detectedService = 'ISO 13485 Medical';
        aiResponse = buildGuideAnswer('iso_13485', 'ISO 13485');
        quickReplies = ['ISO 13485 Info', 'CE Mark Export', 'Book Consultation'];
      }
      else if (msgLower.includes('iatf') || msgLower.includes('16949') || msgLower.includes('apqp') || msgLower.includes('ppap') || msgLower.includes('fmea') || msgLower.includes('automotive core tools')) {
        detectedService = 'IATF 16949';
        aiResponse = buildGuideAnswer('iatf_16949', 'IATF 16949');
        quickReplies = ['Core Tools Training', 'ISO vs IATF', 'MACE Audit Info', 'Book Consultation'];
      }
      else if (msgLower.includes('sedex') || msgLower.includes('smeta') || msgLower.includes('social audit')) {
        detectedService = 'SEDEX / SMETA Audit';
        aiResponse = buildGuideAnswer('sedex_smeta', 'SEDEX / SMETA');
        quickReplies = ['SEDEX SMETA Audit', 'SEDEX vs Social Audit', 'Book Free Consultation'];
      }
      else if (msgLower.includes('mace') || msgLower.includes('maruti')) {
        detectedService = 'MACE Audit';
        aiResponse = buildGuideAnswer('mace_audit', 'MACE Audit');
        quickReplies = ['MACE Audit Prep', 'IATF 16949 Guide', 'Book Consultation'];
      }
      else if (msgLower.includes('fssai') || msgLower.includes('food license')) {
        detectedService = 'FSSAI License';
        aiResponse = buildGuideAnswer('fssai', 'FSSAI');
        quickReplies = ['FSSAI License Quote', 'FSSAI vs ISO 22000', 'ISO 22000 Guide', 'Book Consultation'];
      }
      else if (msgLower.includes('nats') || msgLower.includes('apprentice scheme')) {
        detectedService = 'NATS Scheme';
        aiResponse = buildGuideAnswer('nats', 'NATS');
        quickReplies = ['NATS Scheme Info', 'NATS vs NAPS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('naps') || msgLower.includes('promotion scheme')) {
        detectedService = 'NAPS Scheme';
        aiResponse = buildGuideAnswer('naps', 'NAPS');
        quickReplies = ['NAPS Scheme Info', 'NATS vs NAPS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('profit') || msgLower.includes('cost reduction') || msgLower.includes('capacity improvement')) {
        detectedService = 'Profit Maximization';
        aiResponse = buildGuideAnswer('profit_maximization', 'Profit Maximization');
        quickReplies = ['Profit Maximization Blueprint', '5S Kaizen Workshop', 'Book Free Consultation'];
      }
      else if (msgLower.includes('5s') || msgLower.includes('kaizen') || msgLower.includes('lean')) {
        detectedService = '5S & Lean Kaizen';
        aiResponse = buildGuideAnswer('lean_5s', '5S & Lean');
        quickReplies = ['5S Kaizen Workshop', 'Profit Maximization', 'ZED Scheme', 'Book Free Consultation'];
      }
      else if (msgLower.includes('training') || msgLower.includes('industrial training') || msgLower.includes('placement') || msgLower.includes('leadership')) {
        detectedService = 'Industrial Training';
        aiResponse = buildGuideAnswer('industrial_training', 'Industrial Training');
        quickReplies = ['Industrial Training Program', 'Core Tools Workshop', 'Book Consultation'];
      }

      // GREETINGS & DIRECTORY
      else if (msgLower.includes('certificate') || msgLower.includes('certifications') || msgLower.includes('all services') || msgLower.includes('list')) {
        detectedService = 'Services Directory';
        aiResponse = `📜 **PRV Consultancy Services - Complete Expertise Hub**\n\nWe provide end-to-end consulting for:\n\n1️⃣ **ISO Certifications**: ISO 9001, 14001, 45001, 27001, 22000, 22301, 50001, 13485, 17025\n2️⃣ **Government Schemes**: ZED (80% Subsidy), NATS, NAPS, Udyam, GeM, Startup India\n3️⃣ **Automotive & Core Tools**: IATF 16949, APQP, PPAP, FMEA, MSA, SPC, MACE Audit\n4️⃣ **Ethical & Social Compliance**: SEDEX SMETA (2/4 Pillar), SA 8000, Social Audits\n5️⃣ **Operational Excellence**: 5S, Lean, Kaizen, Cost Reduction, Profit Maximization\n6️⃣ **Industrial & Leadership Training**: Skill workshops & Master Excellence programs\n\n*Which service would you like to explore? Type any query in Hindi, English, or Hinglish!*`;
        quickReplies = ['Which certificate do I need?', 'ZED MSME Subsidy', 'ISO 9001 Guide', 'Book Consultation'];
      }
      else if (msgLower.includes('hi') || msgLower.includes('hello') || msgLower.includes('namaste') || msgLower.includes('madad') || msgLower.includes('help')) {
        detectedService = 'Greeting';
        aiResponse = `🙏 **Namaste! I am "PRV AI Consultant", your official Business Excellence Assistant.**\n\nI am here to understand your business requirements and guide you to the correct certification & subsidy solutions.\n\n• Ask *"I need certificate"* or *"Which certificate is best for my company?"*\n• Ask *"What is ISO 9001?"* or *"What is ZED Scheme?"*\n• Compare *"ISO vs ZED"* or *"NATS vs NAPS"*`;
        quickReplies = ['Which certificate do I need?', 'ZED MSME Subsidy', 'ISO 9001 Process', 'Book Free Consultation'];
      }
      else {
        detectedService = 'General Assistance';
        aiResponse = `🤖 Thank you for consulting **PRV Consultancy Services**!\n\nRegarding your query about: *"${userMessage}"*\n\nPRV Consultancy provides expert consultation across:\n• **ZED MSME Subsidy** (Up to 80% Grant)\n• **ISO Certifications** (9001, 14001, 45001, 27001, 22000, 13485)\n• **IATF 16949 & Core Tools** (Automotive)\n• **SEDEX SMETA & Social Compliance Audits**\n• **NATS & NAPS Apprenticeship Schemes**\n• **5S, Lean & Profit Maximization**\n\nWould you like to speak directly with our senior consultant or schedule a FREE appointment?`;
        quickReplies = ['Which certificate do I need?', 'Book Free Consultation', 'ZED MSME Subsidy', 'WhatsApp Support'];
      }

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
        sessionId
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
