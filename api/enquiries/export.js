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
    const result = await db.query(`SELECT * FROM client_enquiries ORDER BY created_at DESC`);
    const rows = result.rows || [];

    let csv = 'ID,Date,Full Name,Company,Designation,Mobile,Email,City,State,Industry,Company Size,Service,Status,Assigned To,Follow-up Date,Remarks\n';
    rows.forEach(r => {
      csv += `"${r.id}","${r.created_at}","${(r.full_name || '').replace(/"/g, '""')}","${(r.company_name || '').replace(/"/g, '""')}","${(r.designation || '').replace(/"/g, '""')}","${r.mobile_number}","${r.email}","${r.city || ''}","${r.state || ''}","${r.industry || ''}","${r.company_size || ''}","${r.service_required}","${r.status}","${r.assigned_to || ''}","${r.follow_up_date || ''}","${(r.remarks || '').replace(/"/g, '""')}"\n`;
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
};
