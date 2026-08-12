'use strict';

const https = require('https');
const db = require('./db');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const SYSTEM_PROMPT = `You are the PRV Senior AI Business Consultant for PRV Consultancy Services (https://prvconsultancy.com), India's premier international business, quality management, and manufacturing excellence consultancy.

YOUR EXPERTISE & PRV SERVICES:
1. ISO CERTIFICATIONS:
   - ISO 9001:2015 (Quality Management System - QMS)
   - ISO 14001:2015 (Environmental Management System - EMS)
   - ISO 45001:2018 (Occupational Health & Safety - OH&S)
   - ISO 27001:2022 (Information Security - ISMS)
   - ISO 22000:2018 (Food Safety - FSMS)
   - ISO 13485:2016 (Medical Devices QMS & CDSCO MDR Compliance)
   - ISO/IEC 17025:2017 (NABL Testing & Calibration Labs Accreditation)

2. GOVERNMENT SUBSIDIES & SCHEMES:
   - ZED (Zero Defect Zero Effect) MSME Scheme: Up to 80% Subsidy on audit & certification costs, ₹10,000 handholding support grant, 0.5% lower bank interest rate on loans, and up to ₹5 Lakhs capital subsidy for testing equipment.
   - NATS & NAPS Apprenticeship Schemes: Central Government stipend reimbursement up to ₹1,500/month per candidate + 100% exemption from PF & ESI liabilities on apprentice stipends.

3. AUTOMOTIVE & CORE TOOLS:
   - IATF 16949:2016 Automotive QMS (Mandatory for Maruti, Tata, Hyundai, Hero MotoCorp OEM suppliers).
   - 5 Automotive Core Tools: APQP (Advanced Product Quality Planning), PPAP (Production Part Approval Process), FMEA (Failure Mode & Effects Analysis), MSA (Measurement Systems Analysis), SPC (Statistical Process Control).
   - MACE Audit Preparation.

4. EXPORT & GLOBAL COMPLIANCE:
   - CE Marking (European Union conformity for machinery, electronics, and hardware).
   - FDA Registration & Approval (Food, pharma, and cosmetics export to USA).
   - HALAL & Kosher Certification (Middle East, SEA, and Western export).
   - SEDEX SMETA Ethical Audits (2 & 4 Pillar social, labor, safety, and business ethics audits).
   - FSSAI Central License (Statutory Indian food export license).

5. OPERATIONAL EXCELLENCE:
   - 5S Workplace Management & Visual Control (Sort, Set in Order, Shine, Standardize, Sustain).
   - Lean Manufacturing (7 Mudas waste elimination, Value Stream Mapping, SMED line balancing).
   - Kaizen Continuous Improvement & Gemba walks.

TONE & FORMATTING GUIDELINES:
- Be highly professional, authoritative, warm, and consultative.
- Use clean Markdown with clear headings, bullet points, and numbered steps.
- Use tasteful emojis (🚗, 💰, 📜, 🌍, ✨, 🏭, 🔄, 🎓, 🤝) to make responses engaging.
- Highlight PRV Consultancy's practical handholding, documentation support, and guaranteed audit clearance.
- ALWAYS end every response with this exact closing question:
  "Would you like me to recommend the best solution for your business?"`;

// Quick reply generator based on detected keywords
function generateQuickReplies(userMessage, aiAnswer) {
  const msgLower = (userMessage || '').toLowerCase();
  if (msgLower.includes('iso') || msgLower.includes('9001')) {
    return ['Why do I need ISO 9001?', 'ISO 9001 process steps', 'ZED vs ISO 9001', 'Book Free Consultation'];
  }
  if (msgLower.includes('zed') || msgLower.includes('subsidy')) {
    return ['ZED MSME Subsidy', 'NATS Stipend Subsidy', 'ZED vs ISO 9001', 'Book Free Consultation'];
  }
  if (msgLower.includes('auto') || msgLower.includes('iatf') || msgLower.includes('16949')) {
    return ['IATF 16949 Roadmap', 'Core Tools Workshop', 'MACE Audit Prep', 'Book Free Consultation'];
  }
  if (msgLower.includes('export') || msgLower.includes('fda') || msgLower.includes('ce mark')) {
    return ['Exporting Machinery', 'Exporting Food/Pharma', 'SEDEX SMETA Audit', 'Book Free Consultation'];
  }
  if (msgLower.includes('5s') || msgLower.includes('lean') || msgLower.includes('kaizen')) {
    return ['5S Workshop', 'Lean Transformation', 'Kaizen Event', 'Book Free Consultation'];
  }
  return ['Which certificate do I need?', 'ZED MSME Subsidy', 'ISO 9001 QMS', 'Book Free Consultation'];
}

// Fallback response engine if Groq API is unreachable
function getFallbackResponse(userMessage) {
  const msgLower = (userMessage || '').toLowerCase();
  const closing = "\n\nWould you like me to recommend the best solution for your business?";

  if (msgLower.includes('9001') || msgLower.includes('iso 9001') || msgLower.includes('qms')) {
    return `📜 **ISO 9001:2015 — Quality Management System (QMS)**\n\nISO 9001 is an internationally recognized standard for a Quality Management System. It gives organizations a structured framework to:\n- Manage and document key business processes\n- Consistently meet customer requirements\n- Monitor quality performance and reduce operational errors\n- Win government and corporate tender bids\n\n⏱️ **Timeline**: 2 to 4 weeks.` + closing;
  }
  if (msgLower.includes('zed') || msgLower.includes('zero defect') || msgLower.includes('subsidy')) {
    return `💰 **ZED — Zero Defect Zero Effect MSME Scheme**\n\nPRV Consultancy helps MSMEs claim direct government financial subsidies:\n- **Up to 80% Subsidy** on audit & certification costs\n- **₹10,000 Handholding Support Grant** for consultancy\n- **0.5% Concessional Bank Interest Rate** on loans\n- **Up to ₹5 Lakhs Capital Subsidy** for testing equipment` + closing;
  }
  if (msgLower.includes('auto') || msgLower.includes('iatf') || msgLower.includes('16949')) {
    return `🚗 **IATF 16949:2016 — Automotive Quality Management System**\n\nIATF 16949 is mandatory for supplying to automotive OEMs (Maruti Suzuki, Tata Motors, Hyundai, Hero MotoCorp) and Tier-1 vendors.\n\nIncludes 5 Core Tools: **APQP, PPAP, FMEA, MSA, SPC**.` + closing;
  }
  return `🏢 **Welcome to PRV Consultancy Services**\n\nI am your **PRV Senior AI Business Consultant** powered by Groq Intelligence. I specialize in:\n• **ISO Certifications** (9001, 14001, 45001, 27001, 22000, 13485)\n• **ZED MSME Subsidy** (Up to 80% Grant)\n• **IATF 16949 & Automotive Core Tools**\n• **FSSAI License & SEDEX SMETA Audits**\n• **NATS / NAPS Manpower Cost Optimization**` + closing;
}

// Call Groq API via HTTPS
function callGroqApi(messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.5,
      max_tokens: 1024
    });

    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
            if (content) return resolve(content);
          } catch (e) {}
        }
        reject(new Error(`Groq API returned HTTP ${res.statusCode}: ${data}`));
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Groq API request timed out')); });
    req.write(payload);
    req.end();
  });
}

// Main AI Chat Handler Function
async function processAiChat(params) {
  const { message, sessionId = `session_${Date.now()}`, history = [] } = params;
  const userMessage = (message || '').trim();

  if (!userMessage) {
    return {
      success: false,
      message: 'Message cannot be empty.'
    };
  }

  // Format messages array for Groq
  const groqMessages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  // Include recent conversation history if provided
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) {
        groqMessages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      }
    });
  }

  groqMessages.push({ role: 'user', content: userMessage });

  let aiAnswer = '';
  let source = 'Groq LLM (llama-3.3-70b-versatile)';

  try {
    aiAnswer = await callGroqApi(groqMessages);
  } catch (err) {
    console.warn('[AI] Groq API call failed, using local consultant fallback:', err.message);
    aiAnswer = getFallbackResponse(userMessage);
    source = 'PRV Local Consultant Engine';
  }

  // Ensure mandatory closing is present
  const mandatoryClosing = "Would you like me to recommend the best solution for your business?";
  if (!aiAnswer.endsWith(mandatoryClosing)) {
    aiAnswer = aiAnswer.trim() + "\n\n" + mandatoryClosing;
  }

  const quickReplies = generateQuickReplies(userMessage, aiAnswer);

  // Save conversation log asynchronously to database
  try {
    await db.query(
      `INSERT INTO ai_conversations (session_id, user_message, ai_response, detected_service, language) VALUES (?, ?, ?, ?, ?)`,
      [sessionId, userMessage, aiAnswer, 'PRV Groq Consultant', 'en']
    );
  } catch (dbErr) {
    console.warn('[AI] Could not save conversation log:', dbErr.message);
  }

  return {
    success: true,
    answer: aiAnswer,
    response: aiAnswer,
    reply: aiAnswer,
    quickReplies: quickReplies,
    sessionId: sessionId,
    source: source
  };
}

module.exports = {
  processAiChat,
  generateQuickReplies,
  getFallbackResponse
};
