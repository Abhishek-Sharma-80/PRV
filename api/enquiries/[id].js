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

  // Extract ID from req.query.id or URL path
  let id = req.query && req.query.id;
  if (!id) {
    const parts = (req.url || '').split('?')[0].split('/');
    id = parts[parts.length - 1];
  }

  if (!id) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Enquiry ID is required' }));
    return;
  }

  // PATCH /api/enquiries/:id
  if (req.method === 'PATCH') {
    try {
      const data = await getRequestBody(req);
      const { status, assigned_to, follow_up_date, remarks } = data;

      const updateSql = `
        UPDATE client_enquiries
        SET status = COALESCE(?, status),
            assigned_to = COALESCE(?, assigned_to),
            follow_up_date = COALESCE(?, follow_up_date),
            remarks = COALESCE(?, remarks)
        WHERE id = ?
      `;

      await db.query(updateSql, [status || null, assigned_to || null, follow_up_date || null, remarks || null, id]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Enquiry #${id} updated successfully.` }));
    } catch (err) {
      console.error('Error updating enquiry:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error updating enquiry in database.' }));
    }
    return;
  }

  // DELETE /api/enquiries/:id
  if (req.method === 'DELETE') {
    try {
      await db.query(`DELETE FROM client_enquiries WHERE id = ?`, [id]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Enquiry #${id} deleted.` }));
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Error deleting enquiry.' }));
    }
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
};
