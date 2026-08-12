'use strict';

const db = require('../../lib/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
    return;
  }

  try {
    const data = await getRequestBody(req);
    const { full_name, mobile_number, email, company_name, industry, service_required, preferred_date, preferred_time, notes } = data;

    if (!full_name || !mobile_number) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Name and Mobile Number are required.' }));
      return;
    }

    const insertEnquirySql = `
      INSERT INTO client_enquiries 
      (full_name, mobile_number, email, company_name, industry, service_required, message, source, status, follow_up_date, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'AI Consultation Booking', 'Consultation Booked', ?, ?)
    `;

    const todayDate = new Date().toISOString().split('T')[0];
    const result = await db.query(insertEnquirySql, [
      full_name,
      mobile_number,
      email || 'not_provided@prvconsultancy.com',
      company_name || '',
      industry || 'General',
      service_required || 'FREE Expert Consultation',
      `Booked Appointment for ${preferred_date || 'Earliest Slot'} at ${preferred_time || 'Convenient Time'}. Notes: ${notes || 'None'}`,
      preferred_date || todayDate,
      `Preferred Slot: ${preferred_date || 'TBD'} ${preferred_time || ''}`
    ]);

    // Save to appointments table
    try {
      const apptSql = `
        INSERT INTO appointments (full_name, company_name, mobile_number, email, industry, service_required, preferred_date, preferred_time, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(apptSql, [
        full_name,
        company_name || '',
        mobile_number,
        email || '',
        industry || 'General',
        service_required || 'FREE Consultation',
        preferred_date || '',
        preferred_time || '',
        notes || ''
      ]);
    } catch (eAppt) {
      console.error('Error logging appointment:', eAppt);
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Free consultation booked successfully! A PRV Senior Business Advisor will contact you.',
      booking_id: result.lastInsertRowid
    }));
  } catch (err) {
    console.error('Error booking consultation:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Database error booking consultation.' }));
  }
};
