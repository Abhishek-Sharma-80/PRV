'use strict';

const db = require('../../../lib/db');

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

  // GET /api/ai/training
  if (req.method === 'GET') {
    try {
      const result = await db.query('SELECT * FROM ai_training_examples ORDER BY created_at DESC');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result.rows }));
    } catch (err) {
      console.error('Error fetching training examples:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Database error retrieving training examples.' }));
    }
    return;
  }

  // POST /api/ai/training
  if (req.method === 'POST') {
    try {
      const { question, answer, keywords = '' } = await getRequestBody(req);
      if (!question || !answer) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Question and answer are required.' }));
        return;
      }

      const result = await db.query(
        'INSERT INTO ai_training_examples (question, answer, keywords) VALUES (?, ?, ?)',
        [question.trim(), answer.trim(), keywords.trim()]
      );

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: result.lastInsertRowid }));
    } catch (err) {
      console.error('Error saving training example:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Could not save the training example.' }));
    }
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
};
