'use strict';

const db = require('../../lib/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
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

  // GET /api/enquiries
  if (req.method === 'GET') {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const search = urlObj.searchParams.get('search') || (req.query && req.query.search) || '';
      const service = urlObj.searchParams.get('service') || (req.query && req.query.service) || '';
      const status = urlObj.searchParams.get('status') || (req.query && req.query.status) || '';

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

      const result = await db.query(query, params);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: result.rows.length,
        data: result.rows
      }));
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error retrieving enquiries.' }));
    }
    return;
  }

  // POST /api/enquiries
  if (req.method === 'POST') {
    try {
      const data = await getRequestBody(req);
      const {
        full_name, company_name, designation, mobile_number, email,
        city, state, industry, company_size, service_required, message, source
      } = data;

      if (!full_name || !mobile_number || !email || !service_required) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Required fields missing (full_name, mobile_number, email, service_required).'
        }));
        return;
      }

      const insertSql = `
        INSERT INTO client_enquiries 
        (full_name, company_name, designation, mobile_number, email, city, state, industry, company_size, service_required, message, source, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')
      `;

      const result = await db.query(insertSql, [
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
      ]);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Enquiry saved successfully in client_enquiries database!',
        id: result.lastInsertRowid
      }));
    } catch (err) {
      console.error('Error inserting enquiry:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error saving enquiry.' }));
    }
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
};
