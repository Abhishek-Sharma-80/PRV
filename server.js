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
            VALUES (?, ?, ?, ?, ?, 'AI Assistant', 'New', 'Lead auto-captured by PRV AI Assistant')
          `);
          insertLead.run(
            'AI Chat Prospect',
            capturedPhone || 'Provided via Chat',
            capturedEmail || 'ai_chat@prvconsultancy.com',
            'AI Assistant Consultation',
            `User Chat Inquiry: "${userMessage}"`
          );
          leadCaptured = 1;
        } catch (errLead) {
          console.error('AI Lead capture error:', errLead);
        }
      }

      // Keyword matching AI Engine
      if (msgLower.includes('zed') || msgLower.includes('msme') || msgLower.includes('subsidy') || msgLower.includes('zero defect')) {
        detectedService = 'ZED Certification';
        aiResponse = `🏆 **ZED (Zero Defect Zero Effect) Scheme for MSMEs**\n\nPRV Consultancy is an accredited consultant for the Ministry of MSME ZED Certification Scheme.\n\n✨ **Key Benefits & Subsidies**:\n• **Bronze Level**: 80% Subsidy on Certification cost + ₹10,000 Handholding Support Grant.\n• **Silver Level**: 60% Subsidy + Up to ₹5 Lakhs Testing & Capital Subsidy.\n• **Gold Level**: 50% Subsidy + Freight & Concessional Bank Interest (0.5% lower interest).\n\n📋 **Process**: Udyam Registration -> Self-Assessment -> Handholding by PRV Experts -> Desktop Verification -> Final Audit & Subsidy Clearance.\n\nWould you like our senior consultant to guide your MSME unit?`;
        quickReplies = ['Book ZED Consultation', 'ISO 9001 Process', 'NATS Apprenticeship', 'Call +91 98765 43210'];
      }
      else if (msgLower.includes('iso') || msgLower.includes('9001') || msgLower.includes('14001') || msgLower.includes('45001') || msgLower.includes('27001') || msgLower.includes('22000') || msgLower.includes('13485')) {
        detectedService = 'ISO Certifications';
        aiResponse = `📜 **ISO Certification Solutions by PRV Consultancy**\n\nWe provide end-to-end guidance for ISO Certifications across industries:\n\n• **ISO 9001:2015**: Quality Management System (QMS)\n• **ISO 14001:2015**: Environmental Management System (EMS)\n• **ISO 45001:2018**: Occupational Health & Safety (OH&S)\n• **ISO 27001:2022**: Information Security Management (ISMS)\n• **ISO 22000 / FSSAI**: Food Safety Management\n• **ISO 13485**: Medical Devices QMS\n\n⏱️ **Timeline**: 2 to 4 weeks (Includes gap analysis, documentation, internal audit & certification clearance).\n\nWould you like a customized quotation for your organization?`;
        quickReplies = ['Get ISO Quote', 'ZED MSME Subsidy', 'SEDEX Audit', 'Book Consultation'];
      }
      else if (msgLower.includes('sedex') || msgLower.includes('smeta') || msgLower.includes('social audit') || msgLower.includes('oeko') || msgLower.includes('compliance')) {
        detectedService = 'SEDEX / SMETA Audit';
        aiResponse = `🛡️ **Compliance & Social Audits (SEDEX, SMETA, OEKO-TEX)**\n\nPRV Consultancy prepares manufacturing & textile units for export & buyer compliance audits:\n\n• **SEDEX / SMETA 2-Pillar & 4-Pillar Audits**: Labor standards, Health & Safety, Environment, Business Ethics.\n• **Social Audits & MACE**: Complete buyer vendor approval.\n• **OEKO-TEX & FSSAI**: Chemical safety & food compliance certification.\n\nBenefits: Clear international buyer audits, win export orders, and ensure 100% regulatory compliance.`;
        quickReplies = ['Prepare for SMETA Audit', 'ISO Certifications', 'Request Callback', 'Contact PRV Team'];
      }
      else if (msgLower.includes('5s') || msgLower.includes('kaizen') || msgLower.includes('lean') || msgLower.includes('operational excellence')) {
        detectedService = '5S & Kaizen';
        aiResponse = `⚡ **5S & Kaizen Operational Excellence Program**\n\nTransform your shop-floor & office productivity with PRV's Master Business Excellence Blueprint:\n\n• **1S (Sort)**: Eliminate unnecessary tools & waste.\n• **2S (Set in Order)**: Organized layout & quick retrieval.\n• **3S (Shine)**: Clean, safe, and fault-free workplace.\n• **4S (Standardize)**: SOPs, visual control & checklists.\n• **5S (Sustain)**: Mindset shift, daily audits & continuous Kaizen.\n\n📈 **Results**: 25-40% increase in productivity, 50% defect reduction, and high workforce morale.`;
        quickReplies = ['Book 5S Workshop', 'IATF 16949 Training', 'ZED Certification', 'Request Callback'];
      }
      else if (msgLower.includes('nats') || msgLower.includes('naps') || msgLower.includes('apprentice') || msgLower.includes('stipend')) {
        detectedService = 'NATS Apprenticeship';
        aiResponse = `🎓 **NATS & NAPS Government Apprenticeship Scheme**\n\nReduce workforce payroll costs while onboarding trained talent under Central Government Schemes:\n\n• **Financial Support**: Direct stipend subsidy reimbursement up to ₹1,500/month per apprentice.\n• **Statutory Relief**: Exemption from ESI & PF obligations on apprentice stipends.\n• **Talent Pipeline**: Hire ITI, Diploma, and B.Tech/Degree freshers seamlessly.\n• **PRV Handholding**: Complete portal registration, contract creation, stipend claim submission, and monthly compliance management.`;
        quickReplies = ['Onboard Apprentices', 'Corporate Training', 'ISO Certification', 'Call PRV Team'];
      }
      else if (msgLower.includes('iatf') || msgLower.includes('16949') || msgLower.includes('automotive') || msgLower.includes('core tools') || msgLower.includes('apqp') || msgLower.includes('ppap')) {
        detectedService = 'IATF 16949';
        aiResponse = `🚗 **IATF 16949 & Automotive Core Tools**\n\nAutomotive manufacturing consultancy & Core Tools practical training:\n\n• **APQP** (Advanced Product Quality Planning)\n• **PPAP** (Production Part Approval Process)\n• **FMEA** (Failure Mode and Effects Analysis - AIAG-VDA)\n• **MSA** (Measurement Systems Analysis)\n• **SPC** (Statistical Process Control)\n\nEquip your engineers and clear Tier-1 / Tier-2 OEM supplier audits.`;
        quickReplies = ['Core Tools Workshop', 'ISO 9001 QMS', 'ZED Scheme', 'Talk to Consultant'];
      }
      else if (msgLower.includes('price') || msgLower.includes('cost') || msgLower.includes('fee') || msgLower.includes('kharcha') || msgLower.includes('rate') || msgLower.includes('kitna')) {
        detectedService = 'Pricing Inquiry';
        aiResponse = `💰 **Pricing & Investment Overview**\n\nPRV Consultancy provides cost-optimized pricing tailored to your company's size, employee count, and certification scope:\n\n• **ZED Certification**: Up to 80% government subsidy available!\n• **NATS Apprenticeship**: Government stipend reimbursement reduces effective manpower cost.\n• **ISO & Audit Consultancies**: Milestone-based flexible pricing.\n\nType your phone number or email in chat to receive an instant detailed customized quotation!`;
        quickReplies = ['Book Consultation', 'ZED Subsidy Details', 'ISO 9001 Quote', 'Call +91 98765 43210'];
      }
      else if (msgLower.includes('contact') || msgLower.includes('phone') || msgLower.includes('call') || msgLower.includes('number') || msgLower.includes('address') || msgLower.includes('email') || msgLower.includes('whatsapp') || msgLower.includes('samparak')) {
        detectedService = 'Contact Request';
        aiResponse = `📞 **PRV Consultancy Services - Contact Details**\n\n• **Phone / Mobile**: +91 98765 43210\n• **Email**: info@prvconsultancy.com\n• **Coverage**: Pan-India & Global Consultancy Services\n• **Headquarters**: Industrial Hub Consultancy Wing\n\nYou can share your phone number directly here in chat, and our senior consultant will reach out to you within 15 minutes!`;
        quickReplies = ['Book Free Consultation', 'ZED Scheme', 'ISO Certification', 'WhatsApp Chat'];
      }
      else if (msgLower.includes('hi') || msgLower.includes('hello') || msgLower.includes('namaste') || msgLower.includes('madad') || msgLower.includes('help') || msgLower.includes('kaise')) {
        detectedService = 'Greeting';
        aiResponse = `🙏 **Namaste! Welcome to PRV Consultancy Services AI Assistant.**\n\nMain aapki Business Excellence, ISO Certifications, ZED Government Subsidies, SEDEX Audits, aur NATS Apprenticeship me help kar sakta hu.\n\nAap niche diye gaye options chunein ya English/Hindi me apna sawal likhein:\n\n• **ISO Certifications** (9001, 14001, 45001, 27001)\n• **ZED MSME Subsidy** (80% tak govt subsidy)\n• **SEDEX & Social Audits** (Export compliance)\n• **5S / Kaizen** (Shopfloor productivity)\n• **NATS Apprenticeship** (Stipend subsidy)`;
        quickReplies = ['ZED MSME Subsidy', 'ISO 9001 Info', 'NATS Apprenticeship', 'Book Consultation'];
      }
      else {
        aiResponse = `🤖 Thank you for contacting **PRV Consultancy Services**!\n\nRegarding your query about: *"${userMessage}"*\n\nPRV Consultancy is your 1-Stop Partner for:\n1. **ZED Certification & MSME Subsidies** (Up to 80% grant)\n2. **ISO Certifications** (9001, 14001, 45001, 27001)\n3. **SEDEX / SMETA & Buyer Compliance Audits**\n4. **5S & Kaizen Operational Excellence**\n5. **NATS & NAPS Government Apprenticeship Scheme**\n\nPlease select an option below or type your phone number for an immediate consultant callback!`;
        quickReplies = ['ZED Certification', 'ISO Certifications', 'NATS Scheme', 'Book Consultation'];
      }

      if (leadCaptured) {
        aiResponse += `\n\n✅ **Success**: Your contact info has been recorded! A PRV senior consultant will call you shortly.`;
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
