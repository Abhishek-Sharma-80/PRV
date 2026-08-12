'use strict';

const db = require('../../lib/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
    return;
  }

  try {
    const enqRes = await db.query(`SELECT COUNT(*) as cnt FROM client_enquiries`);
    const totalEnquiries = parseInt((enqRes.rows && enqRes.rows[0] && (enqRes.rows[0].cnt || enqRes.rows[0].count)) || 0, 10);

    const semRes = await db.query(`SELECT COUNT(*) as cnt FROM seminar_registrations`);
    const totalSeminars = parseInt((semRes.rows && semRes.rows[0] && (semRes.rows[0].cnt || semRes.rows[0].count)) || 0, 10);

    const apptRes = await db.query(`SELECT COUNT(*) as cnt FROM appointments`);
    const totalAppointments = parseInt((apptRes.rows && apptRes.rows[0] && (apptRes.rows[0].cnt || apptRes.rows[0].count)) || 0, 10);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      stats: {
        totalEnquiries,
        totalSeminars,
        totalAppointments
      }
    }));
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Error loading dashboard statistics.' }));
  }
};
