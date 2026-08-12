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
    const logsRes = await db.query(`SELECT * FROM ai_conversations ORDER BY created_at DESC LIMIT 100`);
    const totalChatsRes = await db.query('SELECT COUNT(*) as c FROM ai_conversations');
    const leadsFromAiRes = await db.query('SELECT COUNT(*) as c FROM ai_conversations WHERE lead_captured = 1');
    const topTopicsRes = await db.query(`
      SELECT detected_service as service, COUNT(*) as count 
      FROM ai_conversations 
      GROUP BY detected_service 
      ORDER BY count DESC 
      LIMIT 5
    `);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      stats: {
        totalChats: parseInt(totalChatsRes.rows[0]?.c || 0, 10),
        leadsFromAi: parseInt(leadsFromAiRes.rows[0]?.c || 0, 10)
      },
      topTopics: topTopicsRes.rows,
      data: logsRes.rows
    }));
  } catch (err) {
    console.error('Error fetching AI logs:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Database error fetching AI logs.' }));
  }
};
