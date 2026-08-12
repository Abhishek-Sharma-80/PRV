'use strict';

const db = require('../../../lib/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Extract ID
  let id = req.query && req.query.id;
  if (!id) {
    const parts = (req.url || '').split('?')[0].split('/');
    id = parts[parts.length - 1];
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM ai_training_examples WHERE id = ?', [id]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Training example #${id} deleted.` }));
    } catch (err) {
      console.error('Error deleting training example:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Could not delete training example.' }));
    }
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
};
