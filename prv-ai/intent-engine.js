'use strict';

/* ── INTENT SIGNATURES ─────────────────────────────────────── */
const INTENT_MAP = {
  WHAT:         ['what is','what are','explain','define','definition','kya hai','kya hota','batao','samjhao','describe','tell me about','bata','what does'],
  WHY:          ['why','reason','purpose','fayda','kyu','kyun','importance','kyu chahiye','kyu zaroori','why need','why should'],
  MANDATORY:    ['mandatory','compulsory','legal','obligation','zaroori','must','required by law'],
  PROCESS:      ['process','steps','procedure','how to get','how to implement','kaise kare','kaise hota','implementation','step by step','how do i get'],
  DOCUMENTS:    ['document','documents','documentation','paperwork','records','required papers','what papers','kaagaz'],
  COST:         ['cost','price','fee','fees','rate','charges','kitna paisa','kharcha','paisa','budget','lagat','kitna lagta','quote','quotation','rupees','inr'],
  TIMELINE:     ['how long','how many days','duration','kitne din','kitna waqt','weeks','months','schedule'],
  BENEFITS:     ['benefit','benefits','advantage','fayda','gain','worth','fayde','kya milega','why get'],
  COMPARISON:   ['difference','vs','versus','compare','comparison','better','fark','which is better','antar'],
  AUDIT:        ['audit','assessment','check','inspect','review','surveyor','auditor','checking'],
  TRAINING:     ['training','train','learn','course','workshop','awareness','sikhna'],
  CONSULTATION: ['consult','consultant','talk','call','baat','meeting','speak','contact','book','appointment','expert','milna','reach out'],
  PROBLEM:      ['problem','issue','rejection','scrap','wastage','waste','slow','downtime','defect','rework','loss','nuksan','reduce cost','quality issue','complaint'],
  RECOMMENDATION:['recommend','suggest','which is best','guide me','sabse best','kaunsa lena chahiye','which should i'],
};

/* ── SERVICE SIGNATURES ──────────────────────────────────────── */
const SERVICE_MAP = {
  ISO9001:     { keywords:['9001','iso 9001','quality management','qms','quality certificate'], label:'ISO 9001' },
  ZED:         { keywords:['zed','zero defect','zero effect','msme scheme','zed certification'], label:'ZED Certification' },
  ISO14001:    { keywords:['14001','iso 14001','environmental management','ems','environment certificate'], label:'ISO 14001' },
  ISO45001:    { keywords:['45001','iso 45001','occupational health','safety management','ohsas','health safety','workplace safety'], label:'ISO 45001' },
  ISO22000:    { keywords:['22000','iso 22000','food safety','fsms','food management','food chain'], label:'ISO 22000' },
  ISO27001:    { keywords:['27001','iso 27001','information security','isms','cybersecurity','data security'], label:'ISO 27001' },
  IATF:        { keywords:['iatf','iatf 16949','automotive','automobile','auto part','car part','oem','tier 1','apqp','ppap','fmea','core tools'], label:'IATF 16949' },
  SEDEX:       { keywords:['sedex','responsible sourcing','ethical sourcing'], label:'SEDEX' },
  SMETA:       { keywords:['smeta','social audit','ethical audit','labor audit'], label:'SMETA' },
  FSSAI:       { keywords:['fssai','food license','food authority','food regulator','food safety india'], label:'FSSAI' },
  MACE:        { keywords:['mace','mace audit','customer audit'], label:'MACE Audit' },
  FIVES:       { keywords:['5s','seiri','seiton','seiso','workplace organisation','workplace organization','housekeeping'], label:'5S' },
  LEAN:        { keywords:['lean','lean manufacturing','8 wastes','eight wastes','value stream','waste elimination'], label:'Lean Manufacturing' },
  KAIZEN:      { keywords:['kaizen','continuous improvement','incremental improvement'], label:'Kaizen' },
  PRODUCTIVITY:{ keywords:['productivity','production efficiency','oee','bottleneck','slow production','throughput'], label:'Productivity Improvement' },
  NATS:        { keywords:['nats','national apprenticeship training','apprentice training'], label:'NATS' },
  NAPS:        { keywords:['naps','national apprenticeship promotion','apprenticeship promotion'], label:'NAPS' },
  TRAINING:    { keywords:['industrial training','corporate training','employee training','staff training','seminar','awareness program'], label:'Industrial Training' },
  EXCELLENCE:  { keywords:['business excellence','master program','profit maximization','operational excellence','business improvement'], label:'Business Excellence' },
};

/* ── UTILITY FUNCTIONS ───────────────────────────────────────── */
function detectService(m){
  for(const [k,s] of Object.entries(SERVICE_MAP)){
    if(s.keywords.some(w=>m.includes(w))) return k;
  }
  return null;
}

function detectIntent(m){
  if(INTENT_MAP.COMPARISON.some(w=>m.includes(w))) return 'COMPARISON';
  if(INTENT_MAP.COST.some(w=>m.includes(w))) return 'COST';
  if(INTENT_MAP.TIMELINE.some(w=>m.includes(w))) return 'TIMELINE';
  if(INTENT_MAP.DOCUMENTS.some(w=>m.includes(w))) return 'DOCUMENTS';
  if(INTENT_MAP.PROCESS.some(w=>m.includes(w))) return 'PROCESS';
  if(INTENT_MAP.AUDIT.some(w=>m.includes(w))) return 'AUDIT';
  if(INTENT_MAP.TRAINING.some(w=>m.includes(w))) return 'TRAINING';
  if(INTENT_MAP.CONSULTATION.some(w=>m.includes(w))) return 'CONSULTATION';
  if(INTENT_MAP.PROBLEM.some(w=>m.includes(w))) return 'PROBLEM';
  if(INTENT_MAP.RECOMMENDATION.some(w=>m.includes(w))) return 'RECOMMENDATION';
  if(INTENT_MAP.MANDATORY.some(w=>m.includes(w))) return 'MANDATORY';
  if(INTENT_MAP.BENEFITS.some(w=>m.includes(w))) return 'BENEFITS';
  if(INTENT_MAP.WHY.some(w=>m.includes(w))) return 'WHY';
  return 'WHAT';
}

function detectLang(text,inp){
  if(inp&&['en','hi','hinglish'].includes(inp.toLowerCase())) return inp.toLowerCase();
  if(/[\u0900-\u097F]/.test(text)) return 'hi';
  const kws=['kya','kaise','hai','hain','batao','chahiye','kitna','kare','kaun','mujhe','meri','kyu','kyun','samjhao','hoga','aur','nahi','bata','wala','mera'];
  const words=text.toLowerCase().replace(/[^a-z\s]/g,'').split(/\s+/);
  if(words.filter(w=>kws.includes(w)).length>=1) return 'hinglish';
  return 'en';
}

function extractContext(m,s){
  if(m.includes('auto part')||m.includes('automotive')||m.includes('automobile')||m.includes('vehicle')) s.industry='Automobile';
  else if(m.includes('food')||m.includes('beverage')||m.includes('restaurant')) s.industry='Food';
  else if(m.includes('textile')||m.includes('garment')) s.industry='Textile';
  else if(m.includes('software')||m.includes('bpo')||m.includes('it company')) s.industry='IT';
  else if(m.includes('chemical')||m.includes('pharma')) s.industry='Chemical';
  else if(m.includes('construction')) s.industry='Construction';
}

/* ── RESPONSE LIBRARY ────────────────────────────────────────── */
const R = {
  ISO9001:{
    WHAT:{ en:`**ISO 9001 — Quality Management System**\n\nISO 9001 is an internationally recognized standard for a Quality Management System (QMS). It gives organizations a structured framework to:\n- Manage and document key business processes\n- Consistently meet customer requirements\n- Monitor quality performance and reduce errors\n- Support continual improvement\n\nApplicable to all industries — manufacturing, IT, healthcare, services, and more.\n\n*Tell me your industry and I can explain how ISO 9001 applies to you.*`,
           hinglish:`**ISO 9001 — Quality Management System**\n\nISO 9001 ek internationally recognized QMS standard hai. Isse:\n- Business processes structured hote hain\n- Customer requirements consistently meet hoti hain\n- Quality performance track hoti hai\n- Errors aur rework reduce hote hain\n\nHar industry me applicable hai.\n\n*Apni industry batao — specific guidance dunga.*`,
           qr:['Why do I need ISO 9001?','ISO 9001 process steps','ISO 9001 documents','Book Free Consultation'] },
    WHY:{ en:`**Why ISO 9001?**\n\nPotential benefits include:\n\n✅ **Process Control** — Standardized SOPs reduce variation and errors\n✅ **Customer Confidence** — Demonstrates structured quality commitment\n✅ **Tender Eligibility** — Often required for government and corporate tenders\n✅ **Corrective Action** — Structured root-cause analysis process\n✅ **Continual Improvement** — Built-in performance measurement cycle\n✅ **Clear Responsibilities** — Defined roles and work instructions\n\n*Actual value depends on implementation quality.*\n\nWhich industry is your company in?`,
          hinglish:`**ISO 9001 kyu lena chahiye?**\n\n✅ Process Control — SOPs se errors reduce hote hain\n✅ Customer Trust — Quality management ka structured proof\n✅ Tender Eligibility — Govt aur corporate tenders ke liye needed\n✅ Corrective Action — Root cause identify hota hai\n✅ Continual Improvement — Built-in performance tracking\n\n*Aapki industry kya hai? Specific guidance de sakta hoon.*`,
          qr:['ISO 9001 for manufacturing','ISO 9001 process','Book Consultation'] },
    MANDATORY:{ en:`**Is ISO 9001 Mandatory?**\n\nISO 9001 is **not universally mandatory**. Whether it is required depends on:\n- **Customer requirements** — Buyers may mandate it as a vendor prerequisite\n- **Tender requirements** — Government and corporate tenders may require it\n- **Industry expectations** — Some sectors prefer or expect certified suppliers\n- **Contracts** — Specific agreements may include it as a condition\n\n*Tell me your industry and customer type — I can help you assess your specific situation.*`,
               hinglish:`**Kya ISO 9001 mandatory hai?**\n\nUniversally mandatory nahi hai — lekin in situations me zaroori ho sakta hai:\n- Customer ne require kiya ho\n- Govt ya corporate tender me needed ho\n- Specific contract condition ho\n\n*Industry aur customer type batao, main assess kar sakta hoon.*`,
               qr:['Who needs ISO 9001?','ISO 9001 benefits','Book Consultation'] },
    PROCESS:{ en:`**ISO 9001 — Implementation Journey**\n\n1. Organization context and scope definition\n2. Initial assessment of current quality practices\n3. Gap analysis — what needs to be developed\n4. Implementation planning and prioritization\n5. QMS documentation — policies, procedures, SOPs\n6. Employee awareness and training\n7. Process implementation in operations\n8. Internal audit\n9. Management review\n10. Corrective actions on findings\n11. Certification audit by accredited body\n12. Continual improvement cycle\n\n*Timeline and effort depend on your organization size, scope, and readiness.*`,
             hinglish:`**ISO 9001 Implementation Steps**\n\n1. Organization context aur scope define karo\n2. Current practices assess karo\n3. Gap analysis karo\n4. Implementation plan banao\n5. Documentation — policies, SOPs\n6. Employee training aur awareness\n7. Operations me implement karo\n8. Internal audit\n9. Corrective actions\n10. Certification audit\n\n*Timeline company ke size aur readiness pe depend karta hai.*`,
             qr:['ISO 9001 documents','ISO 9001 cost factors','Book Consultation'] },
    DOCUMENTS:{ en:`**ISO 9001 — Documentation**\n\nRequired documented information depends on scope and processes. Commonly relevant:\n\n📄 Quality policy and objectives\n📄 Process maps / SOPs / work instructions\n📄 Operational records (job cards, inspection records)\n📄 Monitoring records (KPIs, customer satisfaction)\n📄 Internal audit reports and findings\n📄 Corrective action records (NCR, root cause, closure)\n📄 Training and competency records\n\n*The exact list should match your actual processes — not a generic template.*`,
              qr:['Gap analysis support','Book Consultation'] },
    COST:{ en:`**ISO 9001 — Cost Factors**\n\nNo single fixed cost. Depends on:\n- Organization size and number of employees\n- Certification scope and number of locations\n- Current system maturity and documentation\n- Level of PRV consulting support needed\n- Training requirements\n- Certification body fees (billed separately)\n\nTo provide a meaningful estimate, please share:\n1. Your industry\n2. Approximate employee count\n3. Number of locations\n4. Current certification status`,
          hinglish:`**ISO 9001 — Cost Factors**\n\nFixed cost nahi hota. Depend karta hai:\n- Company size aur employees\n- Locations kitne hain\n- Current system level\n- PRV support kitna chahiye\n- Training requirements\n\nBetter estimate ke liye batao:\n1. Industry?\n2. Employees kitne?\n3. Locations?`,
          qr:['Book Free Consultation','Share requirement details'] },
    TIMELINE:{ en:`**ISO 9001 — Timeline Factors**\n\nNo fixed timeline — depends on:\n⏱ Current system maturity\n⏱ Organization size and complexity\n⏱ Documentation readiness\n⏱ Employee awareness level\n⏱ Internal resource availability\n⏱ Certification body scheduling\n\n*A realistic estimate requires understanding your current situation.*`,
              qr:['Initial assessment','Book Consultation'] },
  },
  ZED:{
    WHAT:{ en:`**ZED — Zero Defect Zero Effect**\n\nZED stands for Zero Defect Zero Effect. It is a manufacturing excellence approach focused on:\n- Improving manufacturing quality and reducing defects\n- Eliminating production waste and rework\n- Improving environmental performance\n- Strengthening business competitiveness\n\nParticularly relevant to MSME manufacturing organizations in India.\n\n*Does your organization have an active Udyam MSME Registration?*`,
           hinglish:`**ZED — Zero Defect Zero Effect**\n\nZED ek manufacturing excellence approach hai jo:\n- Manufacturing quality improve karta hai, defects reduce karta hai\n- Production waste aur rework eliminate karta hai\n- Environmental performance strengthen karta hai\n\nIndia ke MSME manufacturing organizations ke liye relevant.\n\n*Kya aapke paas active Udyam MSME Registration hai?*`,
           qr:['ZED vs ISO 9001','ZED process','Book Consultation'] },
    WHY:{ en:`**Why ZED?**\n\nZED can be relevant for MSME manufacturers wanting to:\n- Systematically improve manufacturing quality and reduce rejections\n- Build environmental responsibility into production\n- Improve productivity and reduce waste\n- Strengthen competitive position\n\n*The specific value depends on your current manufacturing challenges.*\n\nWhat are your main quality or production challenges?`,
          hinglish:`**ZED kyu lena chahiye?**\n\nMSME manufacturers ke liye relevant hai jab:\n- Manufacturing quality systematically improve karni ho\n- Production waste reduce karna ho\n- Competitiveness improve karni ho\n\n*Aapki main challenge kya hai?*`,
          qr:['ZED process','ZED vs ISO 9001','Book Consultation'] },
    COMPARISON:{ en:`**ISO 9001 vs ZED**\n\n| Area | ISO 9001 | ZED |\n|---|---|---|\n| **Primary Focus** | Quality Management System | Manufacturing Excellence |\n| **Scope** | All organizations, all industries | Particularly MSME manufacturers |\n| **Key Areas** | Process, quality, customer satisfaction | Quality, productivity, waste, environment |\n| **Framework** | International management system standard | Manufacturing excellence framework |\n\n🎯 **PRV View**: Neither is automatically better. ISO 9001 provides a structured QMS for any organization; ZED focuses on manufacturing excellence improvement. Your business objective determines which is more relevant — or both may complement each other.\n\n*What is your primary objective?*`,
                hinglish:`**ISO 9001 vs ZED**\n\n| Feature | ISO 9001 | ZED |\n|---|---|---|\n| **Focus** | Quality Management System | Manufacturing Excellence |\n| **Applicability** | Sab industries | MSME Manufacturers |\n\n🎯 Dono ka alag purpose hai. Dono complementary bhi ho sakte hain.\n\n*Aapka main objective kya hai?*`,
                qr:['ISO 9001 details','ZED details','Book Consultation'] },
  },
  ISO14001:{
    WHAT:{ en:`**ISO 14001 — Environmental Management System (EMS)**\n\nISO 14001 provides a framework for organizations to systematically manage environmental aspects and improve environmental performance.\n\nKey areas:\n- Identify and control environmental impacts from operations\n- Establish environmental objectives and targets\n- Meet applicable environmental regulations\n- Improve environmental performance over time\n\n*Relevant to manufacturing, chemical, textile, construction, food processing industries.*\n\nTell me your industry for a more specific explanation.`,
           hinglish:`**ISO 14001 — Environmental Management System**\n\nISO 14001 organizations ko environmental aspects systematically manage karne ka framework deta hai.\n\n- Environmental impacts identify aur control hote hain\n- Environmental objectives establish hote hain\n- Regulations meet hoti hain\n\n*Manufacturing, chemical, textile, food industries ke liye relevant.*`,
           qr:['ISO 14001 benefits','ISO 9001 vs ISO 14001','Book Consultation'] },
    COMPARISON:{ en:`**ISO 9001 vs ISO 14001**\n\n| Area | ISO 9001 | ISO 14001 |\n|---|---|---|\n| **Focus** | Quality Management | Environmental Management |\n| **Purpose** | Customer satisfaction, process control | Environmental performance, compliance |\n| **Applicability** | All organizations | Organizations with environmental aspects |\n\nMany organizations implement both as part of an Integrated Management System (IMS).\n\n*Are you looking for one standard or an integrated system?*`,
                qr:['Integrated management system','Book Consultation'] },
  },
  ISO45001:{
    WHAT:{ en:`**ISO 45001 — Occupational Health & Safety Management System**\n\nISO 45001 provides a framework for organizations to systematically manage workplace health and safety risks.\n\nKey areas:\n- Hazard identification and risk assessment\n- Worker participation in safety management\n- Operational safety controls\n- Incident investigation and corrective action\n- Continual improvement of safety performance\n\n*Particularly relevant to manufacturing, construction, chemicals, and high-risk operations.*\n\nWhat type of operations does your organization run?`,
           hinglish:`**ISO 45001 — Health & Safety Management System**\n\nISO 45001 workplace H&S risks manage karne ka framework deta hai.\n\n- Hazard identification aur risk assessment\n- Worker participation\n- Safety controls aur incident management\n\n*Manufacturing, construction, chemicals ke liye relevant.*`,
           qr:['ISO 45001 process','ISO 45001 vs ISO 14001','Book Consultation'] },
  },
  ISO22000:{
    WHAT:{ en:`**ISO 22000 — Food Safety Management System (FSMS)**\n\nISO 22000 provides a framework for food chain organizations to manage food safety risks systematically.\n\nCovers:\n- HACCP principles\n- Pre-requisite programmes (PRPs)\n- Food safety management processes\n- Food chain communication and traceability\n\n*Relevant to food manufacturing, processing, packaging, catering, cold chain.*\n\nWhat type of food business do you operate?`,
           hinglish:`**ISO 22000 — Food Safety Management System**\n\nISO 22000 food chain organizations ko food safety risks manage karne ka framework deta hai.\n\n- HACCP principles\n- Food safety processes aur traceability\n\n*Food manufacturing, processing, catering ke liye relevant.*`,
           qr:['ISO 22000 vs FSSAI','Book Consultation'] },
    COMPARISON:{ en:`**ISO 22000 vs FSSAI**\n\n| Area | FSSAI | ISO 22000 |\n|---|---|---|\n| **Type** | India food safety regulatory authority | International FSMS standard |\n| **Purpose** | Legal licensing and regulation | Management system framework |\n| **Mandatory** | Yes, for food businesses in India | Voluntary (unless buyer-mandated) |\n\nFSSAI is a regulatory requirement. ISO 22000 is a management system standard. They serve different purposes.\n\n*Are you looking for regulatory compliance or a management system?*`,
                qr:['Book Consultation'] },
  },
  ISO27001:{
    WHAT:{ en:`**ISO 27001 — Information Security Management System (ISMS)**\n\nISO/IEC 27001 provides a systematic framework for managing information security risks.\n\nFocuses on:\n- Identifying and assessing information security risks\n- Implementing appropriate security controls\n- Protecting confidentiality, integrity, and availability of information\n- Continual ISMS improvement\n\n*Not just for IT companies — relevant for any organization handling sensitive information: finance, healthcare, consulting, BPO, manufacturing.*\n\nWhat type of organization do you run?`,
           hinglish:`**ISO 27001 — Information Security Management System**\n\nISO 27001 information security risks manage karne ka framework deta hai.\n\n- Security risks identify karo\n- Appropriate controls implement karo\n- Confidentiality, integrity, availability protect karo\n\n*Sirf IT ke liye nahi — koi bhi sensitive information handle karne wali organization.*`,
           qr:['Who needs ISO 27001?','Book Consultation'] },
  },
  IATF:{
    WHAT:{ en:`**IATF 16949 — Automotive Quality Management System**\n\nIATF 16949 is the automotive sector's QMS standard, designed for organizations in the automotive supply chain.\n\nKey elements:\n- Automotive-specific quality requirements beyond ISO 9001\n- Five Core Tools: **APQP, PPAP, FMEA, MSA, SPC**\n- Zero-defect manufacturing approach\n- Customer-Specific Requirements (CSRs)\n\n*Particularly relevant if you supply to OEMs (Maruti, Tata, Hyundai) or Tier-1 suppliers.*\n\nDo you supply directly to OEMs, or are you a Tier 1/Tier 2 supplier?`,
           hinglish:`**IATF 16949 — Automotive QMS**\n\nIATF 16949 automotive supply chain ke liye designed QMS standard hai.\n\n- Automotive-specific quality requirements\n- 5 Core Tools: APQP, PPAP, FMEA, MSA, SPC\n- Zero-defect focus\n- Customer-Specific Requirements (CSRs)\n\n*OEM suppliers ya Tier-1 ke liye relevant.*\n\nAap OEM ko directly supply karte ho?`,
           qr:['IATF Core Tools','IATF vs ISO 9001','MACE Audit','Book Consultation'] },
    COMPARISON:{ en:`**ISO 9001 vs IATF 16949**\n\n| Area | ISO 9001 | IATF 16949 |\n|---|---|---|\n| **Scope** | All industries | Automotive supply chain only |\n| **Focus** | General quality management | Automotive-specific quality |\n| **Core Tools** | Not required | APQP, PPAP, FMEA, MSA, SPC |\n| **CSRs** | Not applicable | Customer-specific requirements |\n| **Defect Focus** | Quality improvement | Zero PPM defects |\n\n*IATF 16949 includes and extends ISO 9001 for the automotive sector.*\n\nDo you currently have ISO 9001 and looking to upgrade?`,
                qr:['IATF process','Core Tools','Book Consultation'] },
  },
  SEDEX:{
    WHAT:{ en:`**SEDEX — Supplier Ethical Data Exchange**\n\nSEDEX is associated with a platform and ecosystem enabling organizations to manage and share information on responsible sourcing and supply chain sustainability.\n\nSupports visibility into labor practices, health and safety, environmental management, and business ethics.\n\n*Particularly relevant when international buyers require ethical sourcing transparency.*\n\nIs this requirement coming from a specific buyer?`,
           hinglish:`**SEDEX**\n\nSEDEX ek platform/ecosystem hai jo responsible sourcing aur supply chain sustainability ki information share karne me help karta hai.\n\nRelevant hai jab international buyers ethical sourcing information maangte hain.\n\n*Kya ye requirement kisi specific buyer se aa rahi hai?*`,
           qr:['SEDEX vs SMETA','Book Consultation'] },
    COMPARISON:{ en:`**SEDEX vs SMETA**\n\n| Area | SEDEX | SMETA |\n|---|---|---|\n| **What** | Platform/membership ecosystem | Social audit methodology |\n| **Purpose** | Data sharing, supply chain visibility | Audit assessment of workplace practices |\n| **Output** | Supplier profile data | Audit report |\n\n*SEDEX is the platform; SMETA is the audit methodology. Related but not the same.*`,
                qr:['SMETA audit details','Book Consultation'] },
  },
  SMETA:{
    WHAT:{ en:`**SMETA — Sedex Members Ethical Trade Audit**\n\nSMETA is a social audit methodology. Depending on scope (2-pillar or 4-pillar), it covers:\n- **Labor standards** — Working hours, wages, freedom of association\n- **Health and safety** — Workplace safety conditions\n- **Environment** (4-pillar) — Environmental management\n- **Business ethics** (4-pillar) — Anti-bribery, anti-corruption\n\nUsed by global buyers to assess supplier workplace practices.\n\n*Is this requirement from a specific buyer?*`,
           qr:['SMETA preparation','SEDEX vs SMETA','Book Consultation'] },
    AUDIT:{ en:`**SMETA Audit — What to Expect**\n\nA typical SMETA audit includes:\n1. Documentation review (policies, records, permits)\n2. Worker interviews (private, candid)\n3. Facility inspection (H&S, fire safety, exits)\n4. Records review (payroll, attendance, working hours)\n5. Management system assessment\n6. Non-conformance documentation\n\n*Preparation starts with the buyer's specific requirements and audit scope.*\n\nWould you like PRV to assist with pre-audit gap assessment?`,
            qr:['Pre-audit gap assessment','Book Consultation'] },
  },
  FSSAI:{
    WHAT:{ en:`**FSSAI — Food Safety and Standards Authority of India**\n\nFSSAI is India's food safety regulatory authority governing food safety standards, licensing, and registration.\n\nApplicable food businesses may require registration or licensing depending on:\n- Nature of the food business activity\n- Scale of operation\n- Applicable regulatory requirements\n\n*Exact requirements should be verified against current FSSAI regulations.*\n\nWhat type of food business do you operate?`,
           hinglish:`**FSSAI**\n\nFSSAI India ka food safety regulatory authority hai. Food businesses ko applicable registration ya licensing ki zaroorat hoti hai.\n\n*Exact requirements FSSAI regulations se verify karni chahiye.*\n\nAapki food business kya hai?`,
           qr:['FSSAI vs ISO 22000','Book Consultation'] },
  },
  MACE:{
    WHAT:{ en:`**MACE Audit**\n\nThe scope and requirements of a MACE Audit depend on the specific customer, program, or audit framework involved.\n\n*Accurate information must come from the specific customer or audit program — not general sources.*\n\nTo guide you:\n1. Which OEM or customer is requiring this audit?\n2. Do you have the specific checklist from the customer?\n\nPRV can assist with gap assessment and readiness once requirements are confirmed.`,
           qr:['Pre-audit gap assessment','Book Consultation'] },
    AUDIT:{ en:`**MACE Audit Preparation**\n\nOnce customer requirements are confirmed:\n1. Identify audit scope from customer checklist\n2. Gap assessment vs. requirements\n3. Address identified gaps\n4. Ensure documentation and evidence are ready\n5. Shopfloor alignment and employee preparation\n6. Internal mock audit\n\n*PRV can support gap assessment, implementation, and mock audit preparation.*`,
            qr:['Book Consultation'] },
  },
  FIVES:{
    WHAT:{ en:`**5S — Workplace Organization**\n\n5S is a structured methodology for creating an organized, efficient, and sustainable workplace.\n\nThe five steps:\n1. **Sort (Seiri)** — Remove unnecessary items\n2. **Set in Order (Seiton)** — Organize necessary items for efficient access\n3. **Shine (Seiso)** — Clean and identify root causes of dirt\n4. **Standardize (Seiketsu)** — Establish maintenance standards\n5. **Sustain (Shitsuke)** — Build long-term discipline\n\n**Benefits:** Better organization, faster abnormality detection, reduced search time, improved efficiency, foundation for Lean.\n\n*Would you like to understand 5S implementation for your facility?*`,
           hinglish:`**5S — Workplace Organization**\n\n5 Steps:\n1. Sort — Unnecessary items hatao\n2. Set in Order — Organize karo\n3. Shine — Clean rakho\n4. Standardize — Standards banao\n5. Sustain — Long-term maintain karo\n\n**Benefits:** Better organization, efficiency, Lean ka foundation.\n\n*Facility ke liye implementation samajhna chahoge?*`,
           qr:['5S implementation steps','5S vs Lean','Kaizen','Book Consultation'] },
    PROCESS:{ en:`**5S Implementation Journey**\n\n1. Management commitment and alignment\n2. 5S awareness training for all employees\n3. Pilot area selection\n4. Red Tag campaign (Sort)\n5. Shadow boards, floor markings, labeling (Set in Order)\n6. Deep clean and contamination root cause (Shine)\n7. Standards and checklists (Standardize)\n8. Regular 5S audit system\n9. Recognition program\n10. Full facility rollout\n\n*PRV can support from training through implementation and audit.*`,
             qr:['5S training','Book Consultation'] },
  },
  LEAN:{
    WHAT:{ en:`**Lean Manufacturing**\n\nLean Manufacturing is an approach to maximizing customer value by systematically identifying and eliminating non-value-added activities (waste).\n\n**The 8 Wastes (TIMWOODS):**\n1. T — Transportation (unnecessary material movement)\n2. I — Inventory (excess materials, WIP)\n3. M — Motion (unnecessary people movement)\n4. W — Waiting (idle time)\n5. O — Overproduction (making more than needed)\n6. O — Over-processing (more work than required)\n7. D — Defects (rework and rejection)\n8. S — Skills (under-utilized people)\n\n*PRV can assess your process and identify where waste is occurring.*`,
           hinglish:`**Lean Manufacturing**\n\nLean customer value maximize karte hue waste (non-value-added activities) eliminate karne ka approach hai.\n\n8 Wastes: Transportation, Inventory, Motion, Waiting, Overproduction, Over-processing, Defects, Skills.\n\n*PRV aapka process assess karke waste identify kar sakta hai.*`,
           qr:['Lean vs Kaizen','5S and Lean','Productivity assessment','Book Consultation'] },
  },
  KAIZEN:{
    WHAT:{ en:`**Kaizen — Continuous Improvement**\n\nKaizen is a philosophy of making continuous, incremental improvements involving all employees.\n\nKey characteristics:\n- Small, practical improvements every day\n- Employee-driven — not just management\n- Low cost, high impact approach\n- Builds a culture of improvement\n\n**Kaizen vs Lean:** Lean is the broader operational system; Kaizen is the daily improvement practice that drives Lean culture.\n\n*How can I explain Kaizen implementation for your operations?*`,
           hinglish:`**Kaizen — Continuous Improvement**\n\nKaizen ek philosophy hai jisme sab employees daily small improvements karte hain.\n\n- Small daily improvements\n- Employee-driven, not just management\n- Low cost, high impact\n- Improvement culture build karta hai\n\n*Aapke operations me Kaizen kaise implement hoga?*`,
           qr:['Kaizen vs Lean','5S and Kaizen','Book Consultation'] },
  },
  PRODUCTIVITY:{
    WHAT:{ en:`**Productivity Improvement**\n\nProductivity improvement is about increasing output relative to inputs — more value from the same or fewer resources.\n\nPRV's approach:\n1. Measure current performance (OEE, cycle time, defect rate)\n2. Identify bottlenecks and losses\n3. Root cause analysis\n4. Prioritize improvement opportunities\n5. Implement interventions (Lean, 5S, Kaizen, training)\n6. Monitor and sustain results\n\n*What are your current production challenges?*`,
           qr:['Lean assessment','5S setup','Book Consultation'] },
    PROBLEM:{ en:`**Production / Productivity Problem Assessment**\n\nHigh wastage, low output, or quality problems can have multiple root causes:\n\n- **Material losses** — Input quality, handling, storage\n- **Machine downtime** — Breakdown, changeover, setup time\n- **Defects & rework** — Process variation, tooling, operator practice\n- **Waiting** — Material delay, planning gaps, WIP bottleneck\n- **Excess movement** — Poor layout and material handling\n- **Manpower** — Skill gap, absenteeism, workload imbalance\n- **Process inefficiency** — Unoptimized cycle times or batch sizes\n\n*PRV can conduct a process assessment to identify root causes before recommending the right approach.*\n\nWhat type of problem is most prominent — rejection, downtime, slow output, or something else?`,
              hinglish:`**Production Problem Assessment**\n\nCommon root causes:\n- Material losses\n- Machine downtime\n- Defects aur rework\n- Waiting aur delays\n- Poor layout\n- Skill gaps\n\n*PRV process assess karke main causes identify karta hai.*\n\nSabse zyada kaunsi problem hai?`,
              qr:['5S for shopfloor','Lean assessment','Kaizen approach','Book Consultation'] },
  },
  NATS:{
    WHAT:{ en:`**NATS — National Apprenticeship Training Scheme**\n\nNATS is part of India's apprenticeship training ecosystem, providing graduate and diploma engineers structured practical industrial training.\n\n*Current eligibility, process, and applicable provisions should be verified against latest official guidelines.*\n\nTo guide you:\n1. Is your organization in industry or education?\n2. What profile of apprentices are you looking for?`,
           qr:['NATS vs NAPS','Book Consultation'] },
    COMPARISON:{ en:`**NATS vs NAPS**\n\n| Area | NATS | NAPS |\n|---|---|---|\n| **Full Form** | National Apprenticeship Training Scheme | National Apprenticeship Promotion Scheme |\n| **Focus** | Technical/engineering graduates & diploma | Broader apprenticeship promotion |\n\n*Frameworks, target groups, and applicable provisions can differ. Always verify current government guidelines.*`,
                qr:['Book Consultation'] },
  },
  NAPS:{
    WHAT:{ en:`**NAPS — National Apprenticeship Promotion Scheme**\n\nNAPS is a government initiative promoting apprenticeship training across sectors.\n\n*Current eligibility, applicable provisions, and process should be verified against latest official NAPS guidelines.*\n\nWhat type of apprenticeship requirement do you have?`,
           qr:['NATS vs NAPS','Book Consultation'] },
  },
  TRAINING:{
    WHAT:{ en:`**Industrial & Corporate Training — PRV**\n\nPRV can design and deliver training covering:\n\n📘 **Quality & Standards** — ISO awareness, QMS principles, audit training\n🏭 **Manufacturing Excellence** — 5S, Lean, Kaizen, OEE, productivity\n🔒 **Health & Safety** — ISO 45001 awareness, workplace safety\n🌱 **Environment** — ISO 14001 awareness, environmental practices\n💼 **Leadership & Soft Skills** — Team management, communication, problem-solving\n⚙️ **Process Improvement** — Root cause analysis, PDCA, Six Sigma awareness\n\nTraining can be in-house, online, or hybrid — customized to your industry and target audience.\n\n*What type of training are you looking for, and who is the target audience?*`,
           hinglish:`**Industrial & Corporate Training**\n\nPRV cover kar sakta hai:\n- Quality & ISO awareness\n- 5S, Lean, Kaizen, productivity\n- Health & safety awareness\n- Leadership & soft skills\n- Process improvement\n\nIn-house, online, ya hybrid — industry ke according customize.\n\n*Kaunsi training chahiye aur target audience kya hai?*`,
           qr:['ISO awareness training','5S training','Book Consultation'] },
  },
  EXCELLENCE:{
    WHAT:{ en:`**Business Excellence — PRV**\n\nPRV's Business Excellence approach is an integrated improvement program covering:\n- **Strategy** — Direction setting and planning\n- **Quality** — QMS, certifications, compliance\n- **Operations** — Productivity, Lean, 5S, Kaizen\n- **People** — Training, capability, workforce development\n- **Compliance** — Regulatory and customer requirements\n- **Continual Improvement** — Performance measurement and review\n\n*Unlike a single certification, Business Excellence addresses multiple performance dimensions.*\n\nWhat are your main business improvement objectives?`,
           qr:['Business assessment','ISO + Lean combined','Book Consultation'] },
  },
};

const CROSS = {
  RECOMMENDATION:{ en:`**Certification Recommendation — Understanding Your Requirement**\n\nThere is no single best certification for every company. The right option depends on your specific situation.\n\nPlease tell me:\n1. **Industry** — What sector are you in?\n2. **Products/services** — What do you manufacture or provide?\n3. **Company size** — Approximate number of employees?\n4. **Customer requirement** — Has a buyer asked for a specific certification?\n5. **Main objective** — Certification, export, tender eligibility, compliance, or process improvement?\n\nOnce I understand these, I can identify the most relevant options.`,
                    hinglish:`**Certification Recommend karne ke liye —**\n\nHar company ke liye ek best certification nahi hoti. Batao:\n1. Industry kya hai?\n2. Kya manufacture/provide karte ho?\n3. Employees kitne hain?\n4. Customer ne koi specific certification maangi?\n5. Main objective kya hai?`,
                    qr:['ISO 9001 info','ZED info','IATF info','Book Consultation'] },
  GUARANTEE:{ en:`**On Certification Guarantees**\n\nPRV can provide:\n✅ Assessment and gap analysis\n✅ Implementation guidance\n✅ Documentation support\n✅ Training and awareness\n✅ Audit readiness preparation\n\n*Certification approval itself should not be guaranteed. The final outcome depends on the independent certification body and your organization's actual implementation.*\n\nA certificate is most valuable when the underlying system is genuinely implemented.`,
              qr:['Implementation approach','Book Consultation'] },
  CERTIFICATE_ONLY:{ en:`**On Getting Just the Certificate**\n\nI understand the urgency of certification requirements.\n\nHowever, a management-system certificate carries more practical value when the system is genuinely implemented. Customers and auditors increasingly assess whether the system is real — not just documented.\n\nPRV focuses on:\n- Practical gap analysis and improvement\n- Building the system in your actual operations\n- Making your organization genuinely audit-ready\n\n*Would you like to understand what practical implementation looks like for your organization?*`,
                   qr:['Implementation approach','Book Consultation'] },
  ALREADY_CERTIFIED:{ en:`**Already Certified — What Next?**\n\nHaving one certification doesn't mean everything is covered. What is needed depends on your operations and business requirements.\n\nAdditional needs may include:\n- **Sector-specific** — IATF (automotive), ISO 22000 (food), ISO 27001 (IT)\n- **Environmental** — ISO 14001 if environmental aspects are significant\n- **Safety** — ISO 45001 if workplace safety risks exist\n- **Business excellence** — Lean, 5S, Kaizen for operational improvement\n- **Compliance** — SMETA, SEDEX if buyer-required\n\n*Tell me your current certification and business situation.*`,
                     qr:['Integrated management system','Book Consultation'] },
  COST_GENERAL:{ en:`**Consultancy Cost — Key Factors**\n\nCosts depend on:\n- Organization size, scope, and number of employees\n- Number of locations\n- Process complexity\n- Current system maturity\n- Level of PRV support required\n- Training requirements\n- Certification body fees (separate)\n\n*Please share your industry, employee count, locations, and the standard/service needed.*`,
                hinglish:`**Consultancy Cost**\n\nDepend karta hai:\n- Company size aur scope\n- Locations aur employees\n- Current system level\n- PRV support ka level\n\n*Industry, employees, locations, aur required service batao.*`,
                qr:['Book Free Consultation','Share requirement'] },
  TIMELINE_GENERAL:{ en:`**Timeline — Factors**\n\nNo single fixed timeline. Depends on:\n- Organization size and scope\n- Existing processes and documentation\n- Implementation readiness\n- Employee awareness\n- Resource availability\n- Certification body scheduling\n\n*A realistic estimate requires understanding your current situation.*\n\nWould you like PRV to conduct an initial assessment?`,
                    qr:['Initial assessment','Book Consultation'] },
  AUDIT_GENERAL:{ en:`**What Happens in an Audit**\n\nA typical management system audit includes:\n1. Audit planning and scope confirmation\n2. Opening meeting\n3. Document review\n4. Process observation\n5. Employee interviews\n6. Evidence review\n7. Findings documentation\n8. Closing meeting\n9. Corrective action process\n10. Closure and certificate (if applicable)\n\n*Which specific audit are you asking about?*`,
                  qr:['ISO 9001 audit','SMETA audit','MACE audit','Book Consultation'] },
  CONSULTATION:{ en:`**Connect with a PRV Consultant**\n\nOur experts are ready to assist you.\n\nPlease share:\n- **Name**\n- **Company Name**\n- **Industry**\n- **Requirement** (Certification / Audit / Training / Improvement)\n- **Mobile Number**\n- **Email** (optional)\n- **Preferred contact time**\n\nWe will get back to you promptly.`,
                hinglish:`**PRV Consultant se connect karein**\n\nPlease share karein:\n- Naam, Company Name, Industry\n- Requirement\n- Mobile Number, Email\n- Preferred contact time\n\nHum aapse jald contact karenge.`,
                qr:['Book Free Consultation','WhatsApp Support'] },
  NO_INFO:{ en:`I don't have enough verified information to answer that specific point accurately. I don't want to give you an incorrect answer.\n\nIf you share more details about your requirement, I can guide you with the relevant PRV service or help you raise a consultation request.\n\nWhat is your specific requirement?`,
            hinglish:`Is specific point pe verified information nahi hai. Apni requirement share karo — relevant PRV service se guide kar sakta hoon ya consultation request raise kar sakta hoon.`,
            qr:['ISO Certifications','ZED MSME','Lean & 5S','Book Free Consultation'] },
};

function pickLang(block,lang){
  if(!block) return {text:CROSS.NO_INFO.en,qr:['Book Consultation']};
  const text=block[lang]||block.hinglish||block.en||CROSS.NO_INFO.en;
  return {text,qr:block.qr||['Book Free Consultation']};
}

function generateResponse(userMessage,sessionId,inputLang,sessionData){
  const msgLower=userMessage.toLowerCase();
  const lang=detectLang(userMessage,inputLang);
  extractContext(msgLower,sessionData);
  const service=detectService(msgLower);
  let intent=detectIntent(msgLower);

  // Special cross-service patterns
  if(msgLower.includes('already have')&&(msgLower.includes('iso')||msgLower.includes('certified'))){const r=pickLang(CROSS.ALREADY_CERTIFIED,lang);return{intent:'ALREADY_CERTIFIED',service:'General',lang,answer:r.text,quickReplies:r.qr};}
  if(msgLower.includes('guarantee')&&msgLower.includes('certif')){const r=pickLang(CROSS.GUARANTEE,lang);return{intent:'GUARANTEE',service:'General',lang,answer:r.text,quickReplies:r.qr};}
  if((msgLower.includes('only')||msgLower.includes('just'))&&msgLower.includes('certif')&&!msgLower.includes('which')){const r=pickLang(CROSS.CERTIFICATE_ONLY,lang);return{intent:'CERT_ONLY',service:'General',lang,answer:r.text,quickReplies:r.qr};}
  if(intent==='CONSULTATION'){const r=pickLang(CROSS.CONSULTATION,lang);return{intent:'CONSULTATION_REQUEST',service:'PRV Consultation',lang,leadCaptured:1,answer:r.text,quickReplies:r.qr};}
  if(!service&&intent==='COST'){const r=pickLang(CROSS.COST_GENERAL,lang);return{intent:'COST_QUERY',service:'General',lang,answer:r.text,quickReplies:r.qr};}
  if(!service&&intent==='TIMELINE'){const r=pickLang(CROSS.TIMELINE_GENERAL,lang);return{intent:'TIMELINE_QUERY',service:'General',lang,answer:r.text,quickReplies:r.qr};}
  if(!service&&intent==='AUDIT'){const r=pickLang(CROSS.AUDIT_GENERAL,lang);return{intent:'AUDIT_QUERY',service:'General',lang,answer:r.text,quickReplies:r.qr};}
  if(!service&&intent==='RECOMMENDATION'){const r=pickLang(CROSS.RECOMMENDATION,lang);return{intent:'RECOMMENDATION',service:'General',lang,answer:r.text,quickReplies:r.qr};}
  if(!service&&intent==='PROBLEM'){const r=pickLang(R.PRODUCTIVITY&&R.PRODUCTIVITY.PROBLEM,lang);return{intent:'BUSINESS_PROBLEM',service:'Productivity',lang,answer:r.text,quickReplies:r.qr};}
  if(!service&&intent==='TRAINING'){const r=pickLang(R.TRAINING&&R.TRAINING.WHAT,lang);return{intent:'TRAINING_REQUEST',service:'Training',lang,answer:r.text,quickReplies:r.qr};}

  // Service-specific
  if(service&&R[service]){
    const svcLabel=SERVICE_MAP[service]&&SERVICE_MAP[service].label||service;
    // Comparison routing
    if(intent==='COMPARISON'){
      if(service==='ZED'||(service==='ISO9001'&&(msgLower.includes('zed')||msgLower.includes('zero')))){const r=pickLang(R.ZED&&R.ZED.COMPARISON,lang);return{intent:'ISO9001_vs_ZED',service:'ISO 9001 vs ZED',lang,answer:r.text,quickReplies:r.qr};}
      if(service==='IATF'){const r=pickLang(R.IATF&&R.IATF.COMPARISON,lang);return{intent:'IATF_vs_ISO9001',service:'IATF vs ISO 9001',lang,answer:r.text,quickReplies:r.qr};}
      if(service==='SEDEX'||service==='SMETA'){const r=pickLang(R.SEDEX&&R.SEDEX.COMPARISON,lang);return{intent:'SEDEX_vs_SMETA',service:'SEDEX vs SMETA',lang,answer:r.text,quickReplies:r.qr};}
      if(service==='ISO22000'||service==='FSSAI'){const r=pickLang(R.ISO22000&&R.ISO22000.COMPARISON,lang);return{intent:'ISO22000_vs_FSSAI',service:'ISO 22000 vs FSSAI',lang,answer:r.text,quickReplies:r.qr};}
      if(service==='NATS'||service==='NAPS'){const r=pickLang(R.NATS&&R.NATS.COMPARISON,lang);return{intent:'NATS_vs_NAPS',service:'NATS vs NAPS',lang,answer:r.text,quickReplies:r.qr};}
      if(service==='ISO14001'){const r=pickLang(R.ISO14001&&R.ISO14001.COMPARISON,lang);return{intent:'ISO9001_vs_ISO14001',service:'ISO 9001 vs ISO 14001',lang,answer:r.text,quickReplies:r.qr};}
    }
    // Map BENEFITS -> WHY
    if(intent==='BENEFITS') intent='WHY';
    // SMETA AUDIT
    if(intent==='AUDIT'&&service==='SMETA'){const r=pickLang(R.SMETA.AUDIT,lang);return{intent:'SMETA_AUDIT',service:'SMETA',lang,answer:r.text,quickReplies:r.qr};}
    if(intent==='AUDIT'&&service==='MACE'){const r=pickLang(R.MACE.AUDIT,lang);return{intent:'MACE_AUDIT',service:'MACE Audit',lang,answer:r.text,quickReplies:r.qr};}
    // PRODUCTIVITY PROBLEM
    if(intent==='PROBLEM'&&service==='PRODUCTIVITY'){const r=pickLang(R.PRODUCTIVITY.PROBLEM,lang);return{intent:'PRODUCTIVITY_PROBLEM',service:'Productivity',lang,answer:r.text,quickReplies:r.qr};}
    // 5S PROCESS
    if(intent==='PROCESS'&&service==='FIVES'){const r=pickLang(R.FIVES.PROCESS,lang);return{intent:'FIVES_PROCESS',service:'5S',lang,answer:r.text,quickReplies:r.qr};}
    // General intent block
    const svcData=R[service];
    const intentBlock=svcData[intent]||svcData.WHAT;
    if(intentBlock){const r=pickLang(intentBlock,lang);return{intent:service+'_'+intent,service:svcLabel,lang,answer:r.text,quickReplies:r.qr};}
  }

  // Fallback
  const r=pickLang(CROSS.NO_INFO,lang);
  return{intent:'UNKNOWN_QUERY',service:'General',lang,answer:r.text,quickReplies:r.qr};
}

module.exports={generateResponse,detectService,detectIntent,detectLang,extractContext,SERVICE_MAP,INTENT_MAP};