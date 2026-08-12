'use strict';

const path = require('path');
const fs = require('fs');

// Try loading dotenv if available
try {
  require('dotenv').config();
} catch (e) {}

let dbProvider = 'sqlite';
let pgPool = null;
let sqliteDb = null;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && dbUrl.trim() !== '') {
  dbProvider = 'postgres';
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
  });
  console.log('[DB] Configured for PostgreSQL (Vercel Serverless / Cloud DB)');
} else {
  dbProvider = 'sqlite';
  const { DatabaseSync } = require('node:sqlite');
  const DB_PATH = path.join(process.cwd(), 'prv_consultancy.db');
  sqliteDb = new DatabaseSync(DB_PATH);
  console.log('[DB] Configured for Local SQLite (prv_consultancy.db)');
}

let initDone = false;

async function initSchema() {
  if (initDone) return;
  initDone = true;

  if (dbProvider === 'postgres') {
    try {
      const client = await pgPool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS client_enquiries (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

          CREATE TABLE IF NOT EXISTS seminar_registrations (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

          CREATE TABLE IF NOT EXISTS ai_conversations (
            id SERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_message TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            detected_service TEXT DEFAULT 'General',
            detected_intent TEXT DEFAULT 'GENERAL_QUERY',
            language TEXT DEFAULT 'en',
            lead_score INTEGER DEFAULT 0,
            lead_captured INTEGER DEFAULT 0
          );

          CREATE TABLE IF NOT EXISTS ai_training_examples (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            keywords TEXT DEFAULT '',
            active INTEGER DEFAULT 1
          );

          CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

        // Check if client_enquiries is empty and populate sample data
        const res = await client.query('SELECT COUNT(*) as count FROM client_enquiries');
        if (parseInt(res.rows[0].count, 10) === 0) {
          await client.query(`
            INSERT INTO client_enquiries (full_name, company_name, designation, mobile_number, email, city, state, industry, company_size, service_required, message, source, status, assigned_to, follow_up_date, remarks)
            VALUES 
            ('Rajesh Kumar', 'Apex Manufacturing Pvt Ltd', 'Operations Head', '+91 7489 351 297', 'rajesh@apexmfg.in', 'Pune', 'Maharashtra', 'Manufacturing', '50-250 Employees', 'ZED Certification', 'Looking to apply for ZED Gold certification and claim government subsidy.', 'Website Form', 'New', 'Unassigned', '2026-08-05', 'High priority MSME lead'),
            ('Ananya Sharma', 'TexStyles Global', 'Quality Manager', '+91 9812345678', 'ananya@texstyles.com', 'Surat', 'Gujarat', 'Textile & Apparel', '250+ Employees', 'SEDEX / SMETA', 'Need 4-Pillar SMETA audit preparation for upcoming buyer audit.', 'Popup Form', 'Contacted', 'Consultant Team A', '2026-08-04', 'Sent proposal PDF via email'),
            ('Vikram Malhotra', 'AutoTech Components', 'General Manager', '+91 9988776655', 'v.malhotra@autotech.co.in', 'Gurugram', 'Haryana', 'Automotive', '100-500 Employees', 'IATF 16949', 'Core Tools training (APQP, PFMEA, PPAP) required for production engineers.', 'Header CTA', 'Quotation Sent', 'Sales Lead Rohit', '2026-08-06', 'Quotation Q-2026-104 sent'),
            ('Meera Nair', 'Innovatech Systems', 'HR Lead', '+91 9765432109', 'meera@innovatech.io', 'Bengaluru', 'Karnataka', 'IT & Tech Solutions', '20-50 Employees', 'NATS', 'Want to onboard 15 engineering apprentices under NATS scheme.', 'Floating Button', 'Converted', 'Apprenticeship Dept', '2026-08-10', 'Contract signed. Onboarding started.')
          `);
          await client.query(`
            INSERT INTO seminar_registrations (full_name, mobile_number, email, city, qualification, organization, seminar_name, training_type, number_of_participants, message, status, remarks)
            VALUES ('Suresh Verma', '+91 9898989898', 'suresh.verma@gmail.com', 'Noida', 'B.Tech Mechanical', 'Precision Auto Components', 'Master Business Excellence Workshop', 'Corporate Training', 3, 'Enrolling senior floor supervisors for 5S & Kaizen masterclass.', 'Registered', 'Confirmed slot')
          `);
        }
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('[DB] PostgreSQL init error:', err.message);
    }
  } else {
    // SQLite schema init
    sqliteDb.exec(`
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

      CREATE TABLE IF NOT EXISTS ai_training_examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        keywords TEXT DEFAULT '',
        active INTEGER DEFAULT 1
      );

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

    try { sqliteDb.exec(`ALTER TABLE ai_conversations ADD COLUMN detected_intent TEXT DEFAULT 'GENERAL_QUERY';`); } catch (e) {}
    try { sqliteDb.exec(`ALTER TABLE ai_conversations ADD COLUMN language TEXT DEFAULT 'en';`); } catch (e) {}
    try { sqliteDb.exec(`ALTER TABLE ai_conversations ADD COLUMN lead_score INTEGER DEFAULT 0;`); } catch (e) {}

    const countStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM client_enquiries');
    const { count } = countStmt.get();
    if (count === 0) {
      const insertSample = sqliteDb.prepare(`
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

      const insertSampleSeminar = sqliteDb.prepare(`
        INSERT INTO seminar_registrations (full_name, mobile_number, email, city, qualification, organization, seminar_name, training_type, number_of_participants, message, status, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertSampleSeminar.run(
        'Suresh Verma', '+91 9898989898', 'suresh.verma@gmail.com', 'Noida', 'B.Tech Mechanical',
        'Precision Auto Components', 'Master Business Excellence Workshop', 'Corporate Training', 3,
        'Enrolling senior floor supervisors for 5S & Kaizen masterclass.', 'Registered', 'Confirmed slot'
      );
    }
  }
}

// Convert SQLite '?' parameter format to PostgreSQL '$1', '$2', '$3' format
function convertSqlParams(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

/**
 * Execute a SQL query (SELECT, INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL string with ? placeholders
 * @param {Array} params - Parameters array
 * @returns {Promise<{ rows: Array, lastInsertRowid: number, affectedRows: number }>}
 */
async function query(sql, params = []) {
  await initSchema();

  if (dbProvider === 'postgres') {
    const pgSql = convertSqlParams(sql);
    let isInsert = /^\s*INSERT\s+/i.test(sql);
    let finalPgSql = pgSql;
    if (isInsert && !/RETURNING/i.test(pgSql)) {
      finalPgSql += ' RETURNING id';
    }

    const res = await pgPool.query(finalPgSql, params);
    let lastId = 0;
    if (isInsert && res.rows && res.rows.length > 0 && res.rows[0].id) {
      lastId = Number(res.rows[0].id);
    }

    return {
      rows: res.rows || [],
      lastInsertRowid: lastId,
      affectedRows: res.rowCount || 0
    };
  } else {
    // SQLite
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) {
      const stmt = sqliteDb.prepare(sql);
      const rows = stmt.all(...params);
      return { rows, lastInsertRowid: 0, affectedRows: rows.length };
    } else {
      const stmt = sqliteDb.prepare(sql);
      const res = stmt.run(...params);
      return {
        rows: [],
        lastInsertRowid: Number(res.lastInsertRowid || 0),
        affectedRows: Number(res.changes || 0)
      };
    }
  }
}

module.exports = {
  query,
  dbProvider
};
