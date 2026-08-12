'use strict';

const path = require('path');
const fs = require('fs');

let knowledgeBase = { company: {}, guides: {}, comparisons: {} };
let prvAiKb = { services: [] };
let prvAiFaqs = { faqs: [] };
let prvAiObjections = { objections: [] };
let prvAiLeads = { lead_qualification_rules: {} };

try {
  knowledgeBase = require('../knowledge/prv_knowledge_base.json');
} catch (e1) {
  try {
    const kbPath = path.join(process.cwd(), 'knowledge', 'prv_knowledge_base.json');
    if (fs.existsSync(kbPath)) knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
  } catch (e2) {}
}

try {
  prvAiKb = require('../prv-ai/knowledge-base.json');
} catch (e1) {
  try {
    const p = path.join(process.cwd(), 'prv-ai', 'knowledge-base.json');
    if (fs.existsSync(p)) prvAiKb = JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e2) {}
}

try {
  prvAiFaqs = require('../prv-ai/faq-dataset.json');
} catch (e1) {
  try {
    const p = path.join(process.cwd(), 'prv-ai', 'faq-dataset.json');
    if (fs.existsSync(p)) prvAiFaqs = JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e2) {}
}

try {
  prvAiObjections = require('../prv-ai/objection-handling.json');
} catch (e1) {
  try {
    const p = path.join(process.cwd(), 'prv-ai', 'objection-handling.json');
    if (fs.existsSync(p)) prvAiObjections = JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e2) {}
}

try {
  prvAiLeads = require('../prv-ai/lead-qualification.json');
} catch (e1) {
  try {
    const p = path.join(process.cwd(), 'prv-ai', 'lead-qualification.json');
    if (fs.existsSync(p)) prvAiLeads = JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e2) {}
}

module.exports = {
  knowledgeBase,
  prvAiKb,
  prvAiFaqs,
  prvAiObjections,
  prvAiLeads
};
