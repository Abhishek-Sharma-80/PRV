'use strict';

const https = require('https');
const db = require('./db');
const intentEngine = require('../prv-ai/intent-engine');

/**
 * Auto-detect input language (en, hi, hinglish)
 */
function detectLanguage(text, inputLang) {
  if (inputLang && ['en', 'hi', 'hinglish'].includes(inputLang.toLowerCase())) {
    return inputLang.toLowerCase();
  }
  const txt = text.toLowerCase();
  if (/[\u0900-\u097F]/.test(text) || txt.includes('hindi me') || txt.includes('हिंदी में')) {
    return 'hi';
  }
  const hinglishKeywords = ['kya', 'kaise', 'hai', 'hain', 'batao', 'chahiye', 'kitna', 'lagta', 'kare', 'kaun', 'mujhko', 'mujhe', 'aapka', 'hoga', 'baare', 'samjhao', 'meri', 'mera', 'factory'];
  const words = txt.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const matchCount = words.filter(w => hinglishKeywords.includes(w)).length;
  if (matchCount >= 1) return 'hinglish';
  return 'en';
}

/**
 * Process AI Chat Query
 */
async function processAiChat({ message, userMessage, text, conversationId, sessionId, language }) {
  const queryText = (message || userMessage || text || '').trim();
  const sessionKey = conversationId || sessionId || ('session_' + Date.now());
  const inputLang = (language || '').trim();

  if (!queryText) {
    throw { statusCode: 400, message: 'Message content is required.' };
  }

  // Restore conversation context from DB for this session
  const historyRes = await db.query(
    `SELECT user_message, ai_response, detected_service FROM ai_conversations WHERE session_id = ? ORDER BY id ASC LIMIT 10`,
    [sessionKey]
  );

  const sessionData = {
    history: [],
    industry: null,
    business: null,
    product: null
  };

  const historyRows = historyRes.rows || [];
  historyRows.forEach(row => {
    sessionData.history.push({ role: 'user', text: row.user_message });
    sessionData.history.push({ role: 'assistant', text: row.ai_response });

    const pastMsgLower = (row.user_message || '').toLowerCase();
    if (pastMsgLower.includes('auto part') || pastMsgLower.includes('automotive') || pastMsgLower.includes('automobile') || pastMsgLower.includes('car part')) {
      sessionData.industry = 'Automobile';
      sessionData.product = 'Automobile Parts';
    } else if (pastMsgLower.includes('food') || pastMsgLower.includes('beverage') || pastMsgLower.includes('restaurant')) {
      sessionData.industry = 'Food Processing';
    } else if (pastMsgLower.includes('textile') || pastMsgLower.includes('garment')) {
      sessionData.industry = 'Textile';
    } else if (pastMsgLower.includes('software') || pastMsgLower.includes('it company') || pastMsgLower.includes('tech')) {
      sessionData.industry = 'IT & Technology';
    }
  });

  const userLang = detectLanguage(queryText, inputLang);
  const msgLower = queryText.toLowerCase();

  // Update current context if mentioned
  if (msgLower.includes('auto part') || msgLower.includes('automotive') || msgLower.includes('car part') || msgLower.includes('automobile')) {
    sessionData.industry = 'Automobile';
    sessionData.product = 'Automobile Parts';
  } else if (msgLower.includes('food') || msgLower.includes('beverage') || msgLower.includes('restaurant')) {
    sessionData.industry = 'Food Processing';
  } else if (msgLower.includes('textile') || msgLower.includes('garment')) {
    sessionData.industry = 'Textile';
  } else if (msgLower.includes('software') || msgLower.includes('it company') || msgLower.includes('tech')) {
    sessionData.industry = 'IT & Technology';
  }

  let detectedIntent = 'GENERAL_BUSINESS_QUERY';
  let detectedService = 'PRV Consultancy Services';
  let quickReplies = [];
  let leadCaptured = 0;
  let aiResponse = '';
  let retrievedKnowledge = '';

  // STEP 1: Check Database trained examples first (highest priority)
  const normaliseTerms = (val) => [...new Set(String(val).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length >= 2 && !['what', 'which', 'with', 'about', 'your', 'have', 'need', 'please', 'the', 'and', 'for', 'you'].includes(t)))];
  const messageTerms = normaliseTerms(queryText);

  let trainedMatch = null;
  let trainedScore = 0;

  try {
    const trainedRes = await db.query('SELECT * FROM ai_training_examples WHERE active = 1');
    const trainedExamples = trainedRes.rows || [];

    trainedExamples.forEach(ex => {
      const exTerms = normaliseTerms(`${ex.question} ${ex.keywords || ''}`);
      const overlap = messageTerms.filter(t => exTerms.includes(t)).length;
      const score = overlap / Math.max(1, Math.min(messageTerms.length, exTerms.length));
      if (overlap >= 2 && score > trainedScore) {
        trainedScore = score;
        trainedMatch = ex;
      }
    });
  } catch (errTrained) {
    console.warn('[AI] Error fetching trained examples:', errTrained.message);
  }

  if (trainedMatch) {
    detectedIntent = 'TRAINED_EXAMPLE';
    detectedService = 'Trained Database Answer';
    retrievedKnowledge = trainedMatch.answer;
    aiResponse = trainedMatch.answer;
    quickReplies = ['Ask another question', 'Book Free Consultation', 'WhatsApp Support'];
  } else {
    // STEP 2: PRV AI Intent Engine — 20 services × 14 intents
    const engineResult = intentEngine.generateResponse(queryText, sessionKey, inputLang, sessionData);
    detectedIntent = engineResult.intent || 'UNKNOWN';
    detectedService = engineResult.service || 'General';
    aiResponse = engineResult.answer || '';
    quickReplies = engineResult.quickReplies || [];
    leadCaptured = engineResult.leadCaptured || 0;
    retrievedKnowledge = aiResponse.slice(0, 200);
  }

  // STEP 3: Check External Gemini API key if present
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (geminiApiKey && process.env.GEMINI_API_KEY) {
    try {
      const geminiPrompt = {
        contents: [{
          parts: [{
            text: `You are the PRV AI Business Consultant. Answer strictly based on verified facts. Never invent prices or fake guarantees. Return response in ${userLang}.\n\nUser Question: "${queryText}"\nRetrieved Context: ${retrievedKnowledge}`
          }]
        }]
      };

      const postData = JSON.stringify(geminiPrompt);
      const geminiRes = await new Promise((resolve, reject) => {
        const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
        }, res => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(body));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      const geminiJson = JSON.parse(geminiRes);
      if (geminiJson.candidates && geminiJson.candidates[0] && geminiJson.candidates[0].content) {
        aiResponse = geminiJson.candidates[0].content.parts[0].text;
      }
    } catch (eG) {
      console.warn('[AI] Gemini call error, using PRV RAG engine:', eG.message);
    }
  }

  // Save to DB persistently
  try {
    await db.query(
      `INSERT INTO ai_conversations (session_id, user_message, ai_response, detected_service, detected_intent, language, lead_captured)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionKey, queryText, aiResponse, detectedService, detectedIntent, userLang, leadCaptured]
    );
  } catch (errDb) {
    console.error('[AI] DB save error:', errDb.message);
  }

  return {
    success: true,
    answer: aiResponse,
    response: aiResponse,
    reply: aiResponse,
    intent: detectedIntent,
    service: detectedService,
    language: userLang,
    quickReplies,
    leadCaptured,
    sessionId: sessionKey
  };
}

module.exports = {
  processAiChat
};
