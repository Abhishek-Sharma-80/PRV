'use strict';

const db = require('../lib/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.resolve({}); }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { resolve({}); }
    });
  });
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const result = await db.query(`SELECT * FROM appointments ORDER BY created_at DESC`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: result.rows.length, data: result.rows }));
    } catch (err) {
      console.error('Error fetching appointments:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error fetching appointments.' }));
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const data = await getRequestBody(req);
      const { full_name, phone, email, date, time, notes, service_type } = data;

      if (!full_name || !phone || !date || !time) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Required fields missing for appointment booking.' }));
        return;
      }

      const insertSql = `
        INSERT INTO appointments (full_name, phone, email, date, time, notes, service_type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')
      `;

      const result = await db.query(insertSql, [
        full_name,
        phone,
        email || '',
        date,
        time,
        notes || '',
        service_type || 'Consultation'
      ]);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Appointment booked successfully!',
        id: result.lastInsertRowid
      }));
    } catch (err) {
      console.error('Error booking appointment:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error saving appointment.' }));
    }
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
};
