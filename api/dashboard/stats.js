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
    const totalEnquiriesRes = await db.query('SELECT COUNT(*) as c FROM client_enquiries');
    const totalEnquiries = parseInt(totalEnquiriesRes.rows[0]?.c || 0, 10);

    const todayEnquiriesRes = await db.query(
      db.dbProvider === 'postgres' 
        ? `SELECT COUNT(*) as c FROM client_enquiries WHERE DATE(created_at) = CURRENT_DATE`
        : `SELECT COUNT(*) as c FROM client_enquiries WHERE DATE(created_at) = DATE('now')`
    );
    const todayEnquiries = parseInt(todayEnquiriesRes.rows[0]?.c || 0, 10);

    const pendingEnquiriesRes = await db.query(`SELECT COUNT(*) as c FROM client_enquiries WHERE status IN ('New', 'Contacted', 'Quotation Sent')`);
    const pendingEnquiries = parseInt(pendingEnquiriesRes.rows[0]?.c || 0, 10);

    const convertedEnquiriesRes = await db.query(`SELECT COUNT(*) as c FROM client_enquiries WHERE status = 'Converted'`);
    const convertedEnquiries = parseInt(convertedEnquiriesRes.rows[0]?.c || 0, 10);

    const seminarCountRes = await db.query('SELECT COUNT(*) as c FROM seminar_registrations');
    const seminarCount = parseInt(seminarCountRes.rows[0]?.c || 0, 10);

    const serviceDistributionRes = await db.query(`
      SELECT service_required as service, COUNT(*) as count 
      FROM client_enquiries 
      GROUP BY service_required 
      ORDER BY count DESC 
      LIMIT 5
    `);

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
      serviceDistribution: serviceDistributionRes.rows
    }));
  } catch (err) {
    console.error('Error calculating stats:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Error compiling dashboard statistics.' }));
  }
};
