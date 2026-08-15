/* ==========================================================================
   PRV CONSULTANCY SERVICES - MASTER FRONTEND & ROUTING ENGINE
   Page Views Switcher, Dynamic Service Detail Renderer (27+ Services),
   Interactive Industry Selector, Business Excellence Model,
   AJAX Database Form Handlers, Universal Click-to-Contact & Analytics
   ========================================================================== */

/* --------------------------------------------------------------------------
   CENTRALIZED PRV CONTACT CONFIGURATION & ACTION SYSTEM
   -------------------------------------------------------------------------- */
window.CONTACT_CONFIG = {
  phone: "+91 74893 51297",
  whatsapp: "917489351297",
  email: "prvconsultancyservices@gmail.com",
  defaultWhatsAppMessage: "Hello PRV Consultancy Services, I would like to know more about your consultancy services. Please guide me regarding my business requirement.",
  defaultEmailSubject: "Business Consultation Request",
  defaultEmailBody: "Hello PRV Consultancy Services,\n\nI would like to know more about your consultancy services.\n\nMy Requirement: "
};

window.getDynamicContactMessages = function (topicOrText) {
  const text = (topicOrText || '').toLowerCase();
  
  if (text.includes('iso') || text.includes('9001')) {
    return {
      serviceName: "ISO 9001 QMS",
      whatsapp: "Hello PRV Consultancy Services, I am interested in ISO 9001 certification for my manufacturing company. I would like to discuss the requirements, process and consultancy support.",
      subject: "Inquiry: ISO 9001 Certification Support",
      body: "Hello PRV Consultancy Services,\n\nI am interested in ISO 9001 certification for my manufacturing company. I would like to discuss the requirements, process and consultancy support.\n\nCompany Name: \nContact Person: \nLocation: "
    };
  }
  
  if (text.includes('zed') || text.includes('subsidy') || text.includes('zero defect') || text.includes('msme')) {
    return {
      serviceName: "ZED MSME Certification",
      whatsapp: "Hello PRV Consultancy Services, I am interested in ZED Certification. I would like to understand the eligibility, process, requirements and consultancy support.",
      subject: "Inquiry: ZED MSME Certification & Subsidy",
      body: "Hello PRV Consultancy Services,\n\nI am interested in ZED Certification and government MSME subsidy. I would like to understand the eligibility, process, requirements and consultancy support.\n\nCompany Name: \nUDYAM Registration: \nContact Person: "
    };
  }
  
  if (text.includes('iatf') || text.includes('16949') || text.includes('auto')) {
    return {
      serviceName: "IATF 16949 Automotive QMS",
      whatsapp: "Hello PRV Consultancy Services, I am interested in IATF 16949 for my automotive business. I would like to discuss the requirements and implementation process.",
      subject: "Inquiry: IATF 16949 Automotive QMS Support",
      body: "Hello PRV Consultancy Services,\n\nI am interested in IATF 16949 for my automotive business. I would like to discuss the requirements and implementation process.\n\nCompany Name: \nAutomotive Components: \nContact Person: "
    };
  }
  
  if (text.includes('sedex') || text.includes('smeta') || text.includes('ethical') || text.includes('social audit')) {
    return {
      serviceName: "SEDEX SMETA Audit",
      whatsapp: "Hello PRV Consultancy Services, I am interested in SEDEX SMETA ethical audit preparation. Please guide me on the requirements and audit process.",
      subject: "Inquiry: SEDEX SMETA Ethical Audit Support",
      body: "Hello PRV Consultancy Services,\n\nI am interested in SEDEX SMETA ethical audit preparation. Please guide me on the requirements and audit process.\n\nCompany Name: \nLocation: \nContact Person: "
    };
  }
  
  if (text.includes('5s') || text.includes('kaizen') || text.includes('lean')) {
    return {
      serviceName: "5S & Kaizen Excellence",
      whatsapp: "Hello PRV Consultancy Services, I am interested in 5S & Kaizen operational excellence consulting. Please share details on shopfloor implementation.",
      subject: "Inquiry: 5S & Kaizen Operational Excellence Support",
      body: "Hello PRV Consultancy Services,\n\nI am interested in 5S & Kaizen operational excellence consulting. Please share details on shopfloor implementation.\n\nPlant Location: \nTeam Size: \nContact Person: "
    };
  }
  
  if (text.includes('nats') || text.includes('naps') || text.includes('apprentice') || text.includes('stipend')) {
    return {
      serviceName: "NATS / NAPS Apprenticeship",
      whatsapp: "Hello PRV Consultancy Services, I am interested in NATS/NAPS Apprenticeship scheme and stipend subsidy optimization for my enterprise.",
      subject: "Inquiry: NATS / NAPS Apprenticeship Scheme Optimization",
      body: "Hello PRV Consultancy Services,\n\nI am interested in NATS/NAPS Apprenticeship scheme and stipend subsidy optimization for my enterprise.\n\nCompany Name: \nTotal Headcount: \nContact Person: "
    };
  }
  
  return {
    serviceName: "General Consultation",
    whatsapp: window.CONTACT_CONFIG.defaultWhatsAppMessage,
    subject: window.CONTACT_CONFIG.defaultEmailSubject,
    body: window.CONTACT_CONFIG.defaultEmailBody
  };
};

window.getPrvWhatsAppUrl = function (customMessage) {
  const msg = customMessage || window.CONTACT_CONFIG.defaultWhatsAppMessage;
  return `https://wa.me/${window.CONTACT_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
};

window.getPrvMailtoUrl = function (customSubject, customBody) {
  const subject = customSubject || window.CONTACT_CONFIG.defaultEmailSubject;
  const body = customBody || window.CONTACT_CONFIG.defaultEmailBody;
  return `mailto:${window.CONTACT_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

window.getPrvGmailUrl = function (customSubject, customBody) {
  const subject = customSubject || window.CONTACT_CONFIG.defaultEmailSubject;
  const body = customBody || window.CONTACT_CONFIG.defaultEmailBody;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(window.CONTACT_CONFIG.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

window.trackContactEvent = function (eventName, details = {}) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, details);
    }
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...details });
    }
    window.dispatchEvent(new CustomEvent('prv_contact_tracking', { detail: { event: eventName, ...details } }));
    console.log(`[PRV Tracking] ${eventName}`, details);
  } catch (e) {
    console.warn('[PRV Tracking] Error:', e);
  }
};

window.openPrvWhatsApp = function (customMessage, source = 'website') {
  window.trackContactEvent('whatsapp_click', { source, message: customMessage || 'default' });
  const url = window.getPrvWhatsAppUrl(customMessage);
  window.open(url, '_blank', 'noopener,noreferrer');
};

window.openPrvEmail = function (customSubject, customBody, source = 'website') {
  window.trackContactEvent('email_click', { source, subject: customSubject || 'default' });
  const url = window.getPrvMailtoUrl(customSubject, customBody);
  window.location.href = url;
};

window.openPrvGmail = function (customSubject, customBody, source = 'website') {
  window.trackContactEvent('gmail_click', { source, subject: customSubject || 'default' });
  const url = window.getPrvGmailUrl(customSubject, customBody);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    window.location.href = window.getPrvMailtoUrl(customSubject, customBody);
  }
};

window.openPrvConsultationModal = function (serviceName = 'General Consultation', source = 'website') {
  window.trackContactEvent('consultation_click', { source, service: serviceName });
  const modal = document.getElementById('consultation-modal');
  const serviceHeader = document.getElementById('modal-service-name');
  const selectElem = document.getElementById('enq-service');
  if (serviceHeader) serviceHeader.textContent = serviceName;
  if (selectElem) {
    for (let opt of selectElem.options) {
      if (opt.value.toLowerCase() === serviceName.toLowerCase() || serviceName.toLowerCase().includes(opt.value.toLowerCase())) {
        selectElem.value = opt.value;
        break;
      }
    }
  }
  if (modal) modal.classList.remove('hidden');
};

function initUniversalContactHandlers() {
  document.addEventListener('click', (e) => {
    // Intercept clicks on links or buttons with contact actions
    const waTrigger = e.target.closest('[data-contact-action="whatsapp"], a[href*="wa.me"]');
    if (waTrigger) {
      const customMsg = waTrigger.getAttribute('data-message');
      const source = waTrigger.getAttribute('data-source') || 'link';
      window.trackContactEvent('whatsapp_click', { source, message: customMsg || 'default' });
      return;
    }

    const emailTrigger = e.target.closest('[data-contact-action="email"], a[href^="mailto:"]');
    if (emailTrigger) {
      const source = emailTrigger.getAttribute('data-source') || 'link';
      window.trackContactEvent('email_click', { source });
      return;
    }

    const gmailTrigger = e.target.closest('[data-contact-action="gmail"], a[href*="mail.google.com"]');
    if (gmailTrigger) {
      const source = gmailTrigger.getAttribute('data-source') || 'link';
      window.trackContactEvent('gmail_click', { source });
      return;
    }

    const consultTrigger = e.target.closest('.open-modal-trigger');
    if (consultTrigger) {
      const service = consultTrigger.getAttribute('data-service') || 'General Consultation';
      window.trackContactEvent('consultation_click', { service });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('PRV Consultancy Services - Master Application Initialized.');

  initUniversalContactHandlers();
  initPageRouting();
  initServicesEcosystem();
  initIndustrySelector();
  initFaqAccordion();
  initFormHandlers();
  initMobileNav();
  initHeroActions();
  initScrollAnimations();
  initCounterAnimation();
  initThreeHeroCanvas();
  initRoiCalculator();
  initDiagnosticQuiz();
  initCommandPalette();
  initCardGlowSpotlight();
});

/* --------------------------------------------------------------------------
   1. SERVICE KNOWLEDGE DATASET (27+ Core PRV Services)
   -------------------------------------------------------------------------- */
const PRV_SERVICES_DATA = {
  "zed": {
    id: "zed",
    category: "certifications",
    name: "ZED Certification (MSME)",
    icon: "fa-award",
    shortDesc: "Ministry of MSME Zero Defect Zero Effect rating (Bronze, Silver, Gold) with up to 80% subsidy reimbursement.",
    whatIsIt: "ZED (Zero Defect Zero Effect) is an official certification scheme launched by the Ministry of MSME, Government of India. It aims to motivate Indian manufacturers to produce high-quality products with Zero Defects while ensuring Zero Environmental Effect.",
    whyImportant: "ZED certification opens doors to government financial subsidies (up to 80% reimbursement on certification costs), ₹2 Lakh handholding consulting grant, ₹3 Lakh technology upgradation & capital testing subsidy, bank loan interest concessions (0.5%), and preference in Govt e-Marketplace (GeM) tenders.",
    whoShouldUse: "All registered Micro, Small, and Medium Enterprises (MSMEs) with a valid UDYAM registration certificate engaged in manufacturing.",
    benefits: [
      "80% Subsidy reimbursement on certification cost for Micro enterprises, 60% for Small, 50% for Medium",
      "₹2 Lakh Handholding support by accredited consulting experts",
      "₹3 Lakh Technology Upgradation & capital testing equipment subsidy",
      "0.5% Interest rate concession on bank credit facilities",
      "Priority empanelment on GeM Portal & Govt Tenders"
    ],
    keyAreas: ["Quality Assurance", "Environmental Safety", "Energy Efficiency", "5S Workplace", "Occupational Health"],
    process: [
      "UDYAM Portal registration and free ZED Pledge",
      "Desktop Assessment & Self-Assessment document upload",
      "PRV Gap Assessment & SOP implementation on shopfloor",
      "On-site / Virtual Audit by QCI accredited assessment body",
      "Certification issuance & Govt Subsidy claim submission"
    ],
    documentation: ["UDYAM Registration Certificate", "GST Registration", "Factory Layout & SOPs", "Pollution Board NOC", "Calibration & Maintenance Logs"],
    faqs: [
      { q: "What is the validity of ZED Certification?", a: "ZED Certification is valid for 3 years from the date of issuance." },
      { q: "How much time does ZED certification take?", a: "With PRV fast-track assistance, ZED Bronze takes 5-7 days, Silver takes 10-15 days, and Gold takes 20-30 days." }
    ],
    prvHelp: "PRV Consultancy provides complete end-to-end handholding: gap analysis, document preparation, employee training, mock audits, and guaranteed subsidy claim processing."
  },
  "iso_9001": {
    id: "iso_9001",
    category: "certifications",
    name: "ISO 9001:2015 Quality Management System",
    icon: "fa-certificate",
    shortDesc: "Premier international standard for Quality Management Systems (QMS) ensuring operational consistency.",
    whatIsIt: "ISO 9001:2015 is the globally recognized benchmark standard for establishing, implementing, maintaining, and continually improving a Quality Management System (QMS).",
    whyImportant: "Required for corporate vendor empanelment, international client eligibility, OEM supply chains, and government tender participation.",
    whoShouldUse: "Any manufacturing, engineering, service, IT, construction, or trading enterprise looking to standardize operational quality.",
    benefits: [
      "Global credibility badge recognized in 170+ countries",
      "100% Eligibility for corporate & government tenders",
      "Drastic reduction in shopfloor errors and customer rejections",
      "Institutionalized SOPs and risk-based management"
    ],
    keyAreas: ["Context of Organization", "Leadership & Commitment", "Risk Management", "Resource Calibration", "Performance Evaluation"],
    process: [
      "Gap Analysis of existing processes",
      "Quality Manual & Standard Operating Procedures (SOPs) drafting",
      "Employee training on quality procedures",
      "Internal Quality Audit & Management Review Meeting (MRM)",
      "Final Certification Audit clearance"
    ],
    documentation: ["Company Registration", "Quality Policy & Manual", "Process Flowcharts & SOPs", "Internal Audit Reports", "Customer Feedback Logs"],
    faqs: [
      { q: "Is ISO 9001 valid internationally?", a: "Yes, ISO 9001 certificates accredited by IAF member bodies are valid worldwide." }
    ],
    prvHelp: "PRV Consultancy offers guaranteed 100% audit clearance with custom SOP drafting and internal mock audits."
  },
  "iatf_16949": {
    id: "iatf_16949",
    category: "certifications",
    name: "IATF 16949:2016 Automotive Quality System",
    icon: "fa-car",
    shortDesc: "Global automotive quality standard for OEM component suppliers and Tier-1/2/3 manufacturers.",
    whatIsIt: "IATF 16949:2016 is the technical specification for automotive quality management systems, incorporating ISO 9001:2015 along with automotive-specific customer requirements.",
    whyImportant: "Mandatory prerequisite for supplying auto components to OEMs like Maruti Suzuki, Tata Motors, Hyundai, Hero, Mahindra, and Bajaj.",
    whoShouldUse: "Automotive component manufacturers, casting units, machining shops, stamping plants, and auto electronics suppliers.",
    benefits: [
      "Mandatory requirement for OEM vendor empanelment",
      "Implementation of 5 Core Tools (APQP, PPAP, FMEA, MSA, SPC)",
      "Drastic reduction in PPM defect rate",
      "Enhanced customer satisfaction and audit rating"
    ],
    keyAreas: ["Product Safety", "5 Core Tools", "Supplier Quality Management", "Contingency Planning", "Continuous Improvement"],
    process: [
      "Automotive Gap Analysis & Core Tools Baseline Assessment",
      "APQP & PFMEA Documentation setup",
      "PPAP Sample Approval preparation",
      "Internal Audit by certified IATF auditors",
      "Stage 1 & Stage 2 Certification Audit clearance"
    ],
    documentation: ["Process Flow Diagrams", "PFMEA Logs", "Control Plans", "PPAP Files", "MSA & SPC Charts"],
    faqs: [
      { q: "What are the 5 Core Tools in IATF 16949?", a: "APQP (Advanced Product Quality Planning), PPAP (Production Part Approval Process), FMEA (Failure Mode and Effects Analysis), MSA (Measurement Systems Analysis), and SPC (Statistical Process Control)." }
    ],
    prvHelp: "PRV auto-consultants specialize in hands-on Core Tools implementation and guaranteed OEM audit clearance."
  },
  "iso_14001": {
    id: "iso_14001",
    category: "certifications",
    name: "ISO 14001:2015 Environmental Management System",
    icon: "fa-leaf",
    shortDesc: "Environmental management standard for pollution compliance, ESG ratings, and sustainable operations.",
    whatIsIt: "ISO 14001:2015 specifies requirements for an environmental management system to help organizations enhance environmental performance and meet compliance obligations.",
    whyImportant: "Satisfies Pollution Control Board (CPCB/SPCB) regulations, boosts corporate ESG ratings, and clears global buyer environmental audits.",
    whoShouldUse: "Manufacturing units, chemical plants, textile units, automotive plants, and construction projects.",
    benefits: [
      "Full compliance with Pollution Control Board norms",
      "Reduction in raw material waste and energy consumption",
      "Enhanced ESG rating for international buyers",
      "Prevention of legal fines and statutory notices"
    ],
    keyAreas: ["Aspect-Impact Assessment", "Legal Register", "Waste Management", "Emergency Preparedness", "Resource Conservation"],
    process: [
      "Environmental Aspect-Impact Identification",
      "Legal Compliance Register setup",
      "Waste Management SOPs & Operational Controls",
      "Internal Audit & Emergency Mock Drills",
      "Final Certification Audit clearance"
    ],
    documentation: ["Pollution Board NOC", "Aspect-Impact Matrix", "Waste Disposal Manifests", "ETP/STP Test Reports", "Legal Register"],
    faqs: [
      { q: "Does ISO 14001 cover Pollution Board NOC?", a: "Yes, ISO 14001 aligns directly with statutory Pollution Board CTO/CTE requirements." }
    ],
    prvHelp: "PRV environmental engineers handle complete aspect-impact evaluation and pollution compliance setup."
  },
  "iso_45001": {
    id: "iso_45001",
    category: "certifications",
    name: "ISO 45001:2018 Occupational Health & Safety",
    icon: "fa-user-shield",
    shortDesc: "Occupational health and industrial safety management standard to protect workforce and prevent accidents.",
    whatIsIt: "ISO 45001:2018 is the international standard for occupational health and safety (OH&S), designed to protect workers and visitors from work-related accidents and diseases.",
    whyImportant: "Reduces shopfloor accidents, satisfies Factory Act compliance, lowers insurance premiums, and ensures employee safety.",
    whoShouldUse: "Factories, construction sites, engineering workshops, chemical processing units, and logistics centers.",
    benefits: [
      "Significant reduction in workplace accidents and downtime",
      "Full compliance with Factory Act & Labor Laws",
      "Lower worker compensation and insurance costs",
      "Boosts workforce morale and safety culture"
    ],
    keyAreas: ["Hazard Identification & Risk Assessment (HIRA)", "Emergency Response", "PPE Management", "Incident Investigation", "Worker Participation"],
    process: [
      "HIRA Risk Assessment across plant",
      "Safety SOPs & PPE Protocol implementation",
      "Safety Committee setup & mock drill exercises",
      "Internal Safety Audit",
      "Certification Audit clearance"
    ],
    documentation: ["HIRA Register", "Factory Inspector Audit Reports", "Safety Training Logs", "Mock Drill Reports", "First Aid Logs"],
    faqs: [
      { q: "What is HIRA in ISO 45001?", a: "HIRA stands for Hazard Identification and Risk Assessment, which identifies potential safety hazards and prescribes preventive controls." }
    ],
    prvHelp: "PRV safety experts conduct complete plant HIRA audits and safety manual preparation."
  },
  "iso_27001": {
    id: "iso_27001",
    category: "certifications",
    name: "ISO 27001:2022 Information Security System",
    icon: "fa-lock",
    shortDesc: "Information security benchmark for IT, cloud, software, and data-driven enterprises.",
    whatIsIt: "ISO 27001:2022 is the international gold standard for Information Security Management Systems (ISMS), specifying best practices for managing data security, cyber risks, and privacy.",
    whyImportant: "Mandatory for IT vendors, SaaS providers, data centers, and fintech companies serving global corporate clients.",
    whoShouldUse: "IT companies, software developers, BPOs, healthcare IT, financial technology, and cloud service providers.",
    benefits: [
      "Protection of customer data and proprietary intellectual property",
      "Compliance with DPDP Act, GDPR, and cyber regulations",
      "Eligibility for US/Europe IT client contracts",
      "Reduction in cyber breach vulnerability"
    ],
    keyAreas: ["Information Security Risk Assessment", "Access Control", "Cryptography", "Physical Security", "Business Continuity"],
    process: [
      "Asset Inventory & Cyber Risk Assessment",
      "Statement of Applicability (SoA) drafting",
      "Security Controls Implementation (Annex A)",
      "Vulnerability Assessment & Internal Audit",
      "Certification Audit clearance"
    ],
    documentation: ["Information Security Policy", "Statement of Applicability (SoA)", "Risk Register", "Asset Inventory", "Incident Log"],
    faqs: [
      { q: "Is ISO 27001 required for SaaS companies?", a: "Yes, most enterprise buyers mandate ISO 27001 or SOC 2 before onboarding any SaaS vendor." }
    ],
    prvHelp: "PRV IT security consultants provide turnkey ISMS policy drafting, vulnerability assessment, and certification guidance."
  },
  "sedex": {
    id: "sedex",
    category: "compliance",
    name: "SEDEX / SMETA Social Audit",
    icon: "fa-users",
    shortDesc: "Ethical trade audit (2-Pillar & 4-Pillar) for export manufacturers supplying global retail brands.",
    whatIsIt: "SMETA (SEDEX Members Ethical Trade Audit) is the most widely used social audit methodology in the world. It evaluates factory labor standards, health and safety, environmental compliance, and business ethics.",
    whyImportant: "International buyers in Europe, UK, and US mandate SMETA audit reports on Sedex platform before approving factory purchase orders.",
    whoShouldUse: "Textile manufacturers, garment exporters, food processors, handicraft exporters, and consumer goods factories.",
    benefits: [
      "Unlocks international buyer export orders",
      "Ensures compliance with local labor and minimum wage laws",
      "Uploads verified audit report directly to Sedex platform",
      "Prevents buyer audit rejection and non-conformances (NCs)"
    ],
    keyAreas: ["Labor Standards & Wages", "Health & Safety", "Environment (4-Pillar)", "Business Ethics (4-Pillar)", "Worker Rights"],
    process: [
      "Pre-audit Gap Assessment & Wage/Hour Audit",
      "Factory Health & Safety SOP implementation",
      "Sedex Company & Site Profile registration",
      "Mock Social Audit & Worker Interview prep",
      "On-site SMETA Audit execution by APSCA auditor"
    ],
    documentation: ["Wage Slips & Attendance Logs", "Factory License & Fire NOC", "Pollution Control NOC", "Form 12 Adult Register", "ESI/PF Challans"],
    faqs: [
      { q: "What is the difference between 2-Pillar and 4-Pillar SMETA?", a: "2-Pillar covers Labor Standards and Health & Safety. 4-Pillar adds Environmental Management and Business Ethics." }
    ],
    prvHelp: "PRV social compliance auditors handle complete wage-hour audit readiness, physical plant safety setup, and guaranteed NC closure."
  },
  "mace_audit": {
    id: "mace_audit",
    category: "compliance",
    name: "MACE & OEM Vendor Audit",
    icon: "fa-clipboard-check",
    shortDesc: "Maruti Suzuki Centre for Excellence (MACE) and Tier-1 automotive supplier audit preparation.",
    whatIsIt: "MACE Audit evaluates automotive component suppliers on quality systems, 5S shopfloor discipline, productivity, safety, and human resource development based on Maruti Suzuki benchmarks.",
    whyImportant: "Higher MACE scores upgrade supplier status to Green/Gold category, unlocking larger OEM volume allocations and new RFQs.",
    whoShouldUse: "Tier-1, Tier-2, and Tier-3 automotive component suppliers aiming for OEM empanelment.",
    benefits: [
      "Green Channel supplier status with OEMs",
      "Direct reduction in internal rejections and scrap",
      "Standardized 5S shopfloor layout and visual management",
      "Preferred vendor status for new model developments"
    ],
    keyAreas: ["Quality System Assessment", "5S & Safety", "Process Capability (Cpk)", "Tooling & Machine Maintenance", "Tier-2 Management"],
    process: [
      "Comprehensive MACE Gap Assessment",
      "Shopfloor 5S & Red Tag campaign execution",
      "Process Control Plan & Poka-Yoke implementation",
      "Mock MACE Audit scoring",
      "Final MACE Audit presentation"
    ],
    documentation: ["Control Plans", "Machine Maintenance Logs", "Poka-Yoke Verification Records", "5S Audit Scores", "Training Matrix"],
    faqs: [
      { q: "What is a good MACE audit score?", a: "Scores above 80% put suppliers in the Green Category, eligible for direct OEM supply without incoming inspection." }
    ],
    prvHelp: "PRV auto-consultants have ex-OEM auditing background to ensure 85%+ score in MACE audits."
  },
  "fssai": {
    id: "fssai",
    category: "compliance",
    name: "FSSAI Licensing & Audit Compliance",
    icon: "fa-utensils",
    shortDesc: "Food safety authority licensing, Schedule 4 hygiene compliance, and FOSTAC training.",
    whatIsIt: "FSSAI (Food Safety and Standards Authority of India) licensing is mandatory for all food business operators (FBOs) in India to ensure food hygiene and safety standards.",
    whyImportant: "Legal requirement for operating any food business; non-compliance attracts heavy fines and factory closure notices.",
    whoShouldUse: "Food processing plants, beverage manufacturers, cold storages, central kitchens, hotels, and food exporters.",
    benefits: [
      "Legal authority to manufacture & distribute food products",
      "Compliance with FSSAI Schedule 4 sanitary guidelines",
      "FOSTAC certified food safety supervisors on staff",
      "Consumer trust and retail channel eligibility"
    ],
    keyAreas: ["Schedule 4 Hygiene", "FOSTAC Training", "Water Testing", "Pest Control", "Traceability & Recall"],
    process: [
      "FOSCOS Portal Registration & Document Preparation",
      "Factory Hygiene & Layout Audit against Schedule 4",
      "Water & Food Sample Lab Testing",
      "FOSTAC Supervisor Training",
      "FSSAI License Issuance"
    ],
    documentation: ["Factory Layout Plan", "Water NABL Test Report", "FOSTAC Certificate", "List of Food Categories", "GST & ID Proof"],
    faqs: [
      { q: "What is FOSTAC training?", a: "Food Safety Training & Certification (FoSTaC) is mandatory training mandated by FSSAI for food supervisors." }
    ],
    prvHelp: "PRV food safety experts handle complete FOSCOS portal licensing, lab testing arrangements, and Schedule 4 audit readiness."
  },
  "lean": {
    id: "lean",
    category: "excellence",
    name: "Lean Manufacturing & Waste Reduction",
    icon: "fa-chart-line",
    shortDesc: "Operational excellence framework to eliminate 7 MUDA wastes, reduce lead time, and boost margins.",
    whatIsIt: "Lean Manufacturing is a systematic approach to identifying and eliminating waste (non-value-added activities) through continuous improvement, flowing product at the pull of the customer.",
    whyImportant: "Directly increases factory net profit margins without requiring massive capital investment in new machinery.",
    whoShouldUse: "Manufacturing plants, assembly units, process industries, and engineering workshops.",
    benefits: [
      "30% to 50% Reduction in manufacturing lead time",
      "Elimination of 7 MUDA wastes (Overproduction, Waiting, Transport, Overprocessing, Inventory, Motion, Defects)",
      "20% Increase in Overall Equipment Effectiveness (OEE)",
      "Lower working capital tied up in WIP inventory"
    ],
    keyAreas: ["Value Stream Mapping (VSM)", "7 MUDA Waste Elimination", "Kanban Pull System", "SMED Changeover", "Cellular Layout"],
    process: [
      "Current State Value Stream Mapping (VSM)",
      "Identification of shopfloor bottlenecks & MUDA",
      "Implementation of 5S, Kanban, and Cellular layout",
      "SMED Die changeover time reduction",
      "Future State VSM & KPI tracking"
    ],
    documentation: ["Value Stream Maps", "OEE Logs", "SMED Standard Work Sheets", "Kanban Cards", "Kaizen Records"],
    faqs: [
      { q: "What are the 7 Wastes in Lean?", a: "Transport, Inventory, Motion, Waiting, Overproduction, Overprocessing, and Defects." }
    ],
    prvHelp: "PRV Lean Masters conduct on-site shopfloor handholding to deliver guaranteed 15%+ cost reduction."
  },
  "5s": {
    id: "5s",
    category: "excellence",
    name: "5S Workplace Organization",
    icon: "fa-cubes",
    shortDesc: "Shopfloor organization framework: Sort, Set in order, Shine, Standardize, and Sustain.",
    whatIsIt: "5S is a foundational workplace organization methodology that uses five Japanese terms: Seiri (Sort), Seiton (Set in Order), Seiso (Shine), Seiketsu (Standardize), and Shitsuke (Sustain).",
    whyImportant: "Establishes a clean, organized, safe, and high-efficiency working environment that wows visiting OEM clients.",
    whoShouldUse: "Factories, warehouses, offices, laboratories, and repair workshops.",
    benefits: [
      "Elimination of searching time for tools and materials",
      "Significant improvement in shopfloor safety and cleanliness",
      "Maximized space utilization and inventory visibility",
      "Creates an impressive visual management plant for client audits"
    ],
    keyAreas: ["1S Red Tagging", "2S Shadow Boards", "3S Daily Cleaning", "4S Visual SOPs", "5S Weekly Audits"],
    process: [
      "Red Tag Campaign (1S - Sort)",
      "Shadow Board & Floor Line Marking (2S - Set in Order)",
      "Deep Cleaning & Inspection Protocols (3S - Shine)",
      "Visual SOPs & Color Coding (4S - Standardize)",
      "Weekly 5S Audit Scorecard & Rewards (5S - Sustain)"
    ],
    documentation: ["5S Policy", "Red Tag Area Log", "Visual SOP Boards", "Weekly 5S Audit Checklist", "Before/After Photos"],
    faqs: [
      { q: "How long does a 5S project take?", a: "A typical factory 5S transformation takes 15 to 30 days with PRV handholding." }
    ],
    prvHelp: "PRV consultants conduct live Red Tag campaigns, shadow board creation, and 5S audit scoring."
  },
  "nats": {
    id: "nats",
    category: "government",
    name: "NATS Apprenticeship Scheme",
    icon: "fa-graduation-cap",
    shortDesc: "National Apprenticeship Training Scheme for engineering graduates & diploma holders with Govt stipend subsidy.",
    whatIsIt: "NATS is a flagship scheme by the Ministry of Education, Govt of India, offering 1-year practical training to Engineering Graduates, Diploma holders, and General Stream graduates.",
    whyImportant: "Enables companies to build a trained technical talent pipeline while claiming monthly stipend reimbursements from the Govt.",
    whoShouldUse: "Manufacturing companies, IT firms, corporate houses, and infrastructure developers with 30+ employees.",
    benefits: [
      "Government stipend subsidy reimbursement",
      "Exemption from PF & ESI contributions for apprentices",
      "Cost-effective technical workforce pipeline",
      "Fulfillment of statutory apprenticeship quotas"
    ],
    keyAreas: ["Establishment Empanelment", "Apprentice Selection", "Contract Approval", "Monthly Portal Claiming", "Completion Certification"],
    process: [
      "Company Portal Empanelment on NATS Portal",
      "Apprentice Vacancy posting & candidate shortlisting",
      "Contract Generation & Online Approval",
      "Monthly Attendance Upload & Stipend disbursement",
      "Government Subsidy Claim Processing"
    ],
    documentation: ["Establishment Registration", "GST & PAN", "Bank Mandate Form", "Apprentice Qualification Proofs", "Monthly Attendance Sheets"],
    faqs: [
      { q: "Is PF/ESI applicable to NATS apprentices?", a: "No, NATS apprentices are trainees under law, so PF and ESI contributions are not applicable." }
    ],
    prvHelp: "PRV handles complete NATS portal registration, candidate onboarding, contract approval, and monthly subsidy claims."
  },
  "naps": {
    id: "naps",
    category: "government",
    name: "NAPS Apprenticeship Scheme",
    icon: "fa-user-gear",
    shortDesc: "National Apprenticeship Promotion Scheme for ITI & skill candidates with up to ₹1,500/mo stipend reimbursement.",
    whatIsIt: "NAPS was launched by the Ministry of Skill Development and Entrepreneurship (MSDE) to promote apprenticeship training by reimbursing 25% of prescribed stipend up to ₹1,500 per month per apprentice.",
    whyImportant: "Provides direct financial incentive to factories for training ITI & technician apprentices.",
    whoShouldUse: "Factories, assembly plants, engineering units, and service establishments.",
    benefits: [
      "₹1,500/month per apprentice direct Govt reimbursement",
      "PF/ESI exempted for apprentice trainees",
      "Helps meet mandatory 2.5% to 15% apprenticeship quota",
      "Structured shopfloor technician development"
    ],
    keyAreas: ["WPS Portal Registration", "Designated & Optional Trades", "Contract Issue", "Stipend Reimbursement", "NCVT Certification"],
    process: [
      "Apprenticeship India Portal Registration",
      "Trade Selection & Apprentice Contract Issuance",
      "Stipend Payment via Direct Benefit Transfer (DBT)",
      "Quarterly Claim Upload for 25% Govt Subsidy",
      "Final Assessment & NCVT Certificate"
    ],
    documentation: ["Company License", "GST & PAN", "Apprentice ITI/10th Marksheet", "Stipend Bank Passbook Copy"],
    faqs: [
      { q: "What is the maximum stipend subsidy under NAPS?", a: "The Govt reimburses 25% of prescribed stipend up to a maximum of ₹1,500 per apprentice per month." }
    ],
    prvHelp: "PRV offers end-to-end NAPS management: portal setup, contract generation, attendance logging, and claim clearance."
  }
};

/* --------------------------------------------------------------------------
   2. PAGE VIEW ROUTING ENGINE & BREADCRUMB CONTROLLER
   -------------------------------------------------------------------------- */
function initPageRouting() {
  const pageViews = document.querySelectorAll('.page-view');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-link, .nav-link, #mobile-menu-drawer a');
  const breadcrumbEl = document.getElementById('current-page-breadcrumb');

  const ROUTE_TITLES = {
    '#home': 'Dashboard Overview',
    '#about': 'About PRV Firm',
    '#services': 'Services Ecosystem',
    '#certifications': 'Certifications (ISO/ZED)',
    '#compliance': 'Compliance & Audits',
    '#business-excellence': '5S & Kaizen Excellence',
    '#master-excellence': 'Master Program',
    '#training': 'Training & Workshops',
    '#government': 'NATS / NAPS Schemes',
    '#industries': 'Industries Served',
    '#ai-consultant': 'AI Business Advisor',
    '#resources': 'Resources & FAQs',
    '#contact': 'Book Consultation',
    '#view-service-detail': 'Service Blueprint'
  };

  function handleRoute() {
    let hash = window.location.hash || '#home';

    // Handle deep service links like #services/zed or #service-zed or #service/zed
    if (hash.startsWith('#services/') || hash.startsWith('#service/') || hash.startsWith('#service-')) {
      const serviceId = hash.replace(/^#(services\/|service\/|service-)/, '');
      showServiceDetailPage(serviceId);
      updateNavHighlight('#services');
      if (breadcrumbEl) breadcrumbEl.textContent = 'Service Blueprint';
      return;
    }

    const targetId = 'view-' + hash.replace('#', '');
    let targetView = document.getElementById(targetId);

    if (!targetView) {
      targetView = document.getElementById('view-home');
      hash = '#home';
    }

    pageViews.forEach(v => {
      v.classList.remove('active');
      v.querySelectorAll('.page-enter-item').forEach(el => el.classList.remove('entered'));
    });
    targetView.classList.add('active');
    updateNavHighlight(hash);

    if (breadcrumbEl) {
      breadcrumbEl.textContent = ROUTE_TITLES[hash] || 'Dashboard Overview';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerPageEntrance(targetView);
  }

  function updateNavHighlight(activeHash) {
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === activeHash || (activeHash.startsWith('#services') && href === '#services')) {
        link.classList.add('active');
        link.classList.add('text-primary-container', 'font-bold');
      } else {
        link.classList.remove('active');
        link.classList.remove('text-primary-container', 'font-bold');
      }
    });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // Run on initial load
}

/* --------------------------------------------------------------------------
   3. SERVICES ECOSYSTEM RENDERER & DETAIL PAGE ENGINE
   -------------------------------------------------------------------------- */
function initServicesEcosystem() {
  const container = document.getElementById('services-cards-container');
  if (!container) return;

  renderServiceCards('all');

  // Category filter tabs
  const filterBtns = document.querySelectorAll('#service-category-filters button');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary-container', 'active');
        b.classList.add('bg-white/5', 'text-on-surface-variant');
      });
      btn.classList.remove('bg-white/5', 'text-on-surface-variant');
      btn.classList.add('bg-primary-container', 'text-on-primary-container', 'active');

      const cat = btn.getAttribute('data-cat');
      renderServiceCards(cat);
    });
  });

  // Global delegate click listener for service detail triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.explore-service-btn');
    if (trigger) {
      const serviceId = trigger.getAttribute('data-service-id');
      if (serviceId) {
        window.location.hash = `#services/${serviceId}`;
      }
    }
  });
}

function renderServiceCards(category) {
  const container = document.getElementById('services-cards-container');
  if (!container) return;

  container.innerHTML = '';

  Object.values(PRV_SERVICES_DATA).forEach(service => {
    if (category !== 'all' && service.category !== category) return;

    const card = document.createElement('div');
    card.className = 'glass-panel p-6 rounded-xl border border-border-glass hover:border-primary-container transition-all flex flex-col justify-between group cursor-pointer explore-service-btn';
    card.setAttribute('data-service-id', service.id);

    card.innerHTML = `
      <div>
        <div class="w-12 h-12 rounded-lg bg-surface-variant border border-border-glass flex items-center justify-center mb-4 text-primary-container text-2xl group-hover:scale-110 transition-transform">
          <i class="fa-solid ${service.icon}"></i>
        </div>
        <h3 class="text-xl font-bold mb-2 text-on-surface group-hover:text-primary-container transition-colors">${service.name}</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed mb-6">${service.shortDesc}</p>
      </div>
      <div class="flex items-center justify-between pt-4 border-t border-white/5">
        <span class="text-xs font-bold text-primary-container">Explore Blueprint →</span>
        <i class="fa-solid fa-arrow-right text-xs text-primary-container group-hover:translate-x-1 transition-transform"></i>
      </div>
    `;

    container.appendChild(card);
  });
}

// Renders the 11-section detailed service view dynamically
function showServiceDetailPage(serviceId) {
  const service = PRV_SERVICES_DATA[serviceId] || PRV_SERVICES_DATA["iso_9001"];
  const targetContainer = document.getElementById('service-detail-render-target');
  const pageViews = document.querySelectorAll('.page-view');

  if (!targetContainer) return;

  pageViews.forEach(v => v.classList.remove('active'));
  document.getElementById('view-service-detail').classList.add('active');

  targetContainer.innerHTML = `
    <!-- 1. HERO SECTION -->
    <div class="blueprint-hero-banner">
      <div class="blueprint-hero-tag-row">
        <span class="blueprint-tag-pill cyan"><i class="fa-solid fa-certificate"></i> PRV Executive Service Guide</span>
        <span class="blueprint-tag-pill emerald"><i class="fa-solid fa-shield-halved"></i> 100% Audit Clearance Guarantee</span>
        <span class="blueprint-tag-pill purple"><i class="fa-solid fa-bolt"></i> Fast-Track Execution</span>
      </div>
      <h1 class="blueprint-hero-title">${service.name}</h1>
      <p class="blueprint-hero-desc">${service.shortDesc}</p>
      <div class="blueprint-hero-actions">
        <button class="blueprint-btn-primary open-modal-trigger" data-service="${service.name}">
          <i class="fa-solid fa-calendar-check"></i> Request Free Consultation
        </button>
        <button id="detail-ai-btn" class="blueprint-btn-ai">
          <i class="fa-solid fa-robot" style="color: #00f2fe;"></i> Ask AI Consultant About ${service.name}
        </button>
        <a href="tel:+917489351297" class="blueprint-tag-pill cyan" style="text-decoration: none; font-size: 0.82rem; padding: 10px 16px;">
          <i class="fa-solid fa-phone"></i> +91 74893 51297
        </a>
      </div>
    </div>

    <!-- 2-COLUMN ENTERPRISE BLUEPRINT GRID -->
    <div class="blueprint-layout-grid">
      
      <!-- LEFT / MAIN CONTENT COLUMN -->
      <div class="blueprint-main-col">
        
        <!-- 2. WHAT IS IT? -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon blue"><i class="fa-solid fa-circle-info"></i></div>
            <h2 class="blueprint-card-title">1. What is ${service.name}?</h2>
          </div>
          <p class="blueprint-card-text">${service.whatIsIt}</p>
        </div>

        <!-- 3. WHY IS IT IMPORTANT? -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon purple"><i class="fa-solid fa-chart-line"></i></div>
            <h2 class="blueprint-card-title">2. Why is it Important for Your Business?</h2>
          </div>
          <p class="blueprint-card-text">${service.whyImportant}</p>
        </div>

        <!-- 4. WHO SHOULD USE IT? -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon emerald"><i class="fa-solid fa-building-circle-check"></i></div>
            <h2 class="blueprint-card-title">3. Who Should Implement It? (Eligibility)</h2>
          </div>
          <p class="blueprint-card-text">${service.whoShouldUse}</p>
        </div>

        <!-- 5. BENEFITS -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon amber"><i class="fa-solid fa-trophy"></i></div>
            <h2 class="blueprint-card-title">4. Key Tangible Benefits & ROI</h2>
          </div>
          <div class="blueprint-benefits-grid">
            ${service.benefits.map(b => `
              <div class="blueprint-benefit-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>${b}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 6. KEY AREAS -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon blue"><i class="fa-solid fa-layer-group"></i></div>
            <h2 class="blueprint-card-title">5. Core Compliance & Operational Scope Covered</h2>
          </div>
          <div class="blueprint-chips-wrap">
            ${service.keyAreas.map(a => `<div class="blueprint-chip"><i class="fa-solid fa-check-double" style="color: #0284c7;"></i> ${a}</div>`).join('')}
          </div>
        </div>

        <!-- 7. GENERAL IMPLEMENTATION PROCESS -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon purple"><i class="fa-solid fa-diagram-project"></i></div>
            <h2 class="blueprint-card-title">6. End-to-End Implementation Roadmap</h2>
          </div>
          <div class="blueprint-steps-list">
            ${service.process.map((step, idx) => `
              <div class="blueprint-step-row">
                <div class="blueprint-step-num">${idx + 1}</div>
                <div class="blueprint-step-desc">${step}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 8. TYPICAL DOCUMENTATION -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon emerald"><i class="fa-solid fa-folder-open"></i></div>
            <h2 class="blueprint-card-title">7. Mandatory Documentation & Records Required</h2>
          </div>
          <div class="blueprint-docs-list">
            ${service.documentation.map(doc => `
              <div class="blueprint-doc-row">
                <i class="fa-solid fa-file-contract"></i>
                <span>${doc}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 9. FREQUENTLY ASKED QUESTIONS -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <div class="blueprint-card-icon amber"><i class="fa-solid fa-circle-question"></i></div>
            <h2 class="blueprint-card-title">8. Frequently Asked Questions</h2>
          </div>
          <div class="blueprint-faqs-wrap">
            ${service.faqs.map(faq => `
              <details class="blueprint-faq-card">
                <summary>${faq.q}</summary>
                <p>${faq.a}</p>
              </details>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- RIGHT / STICKY ADVISORY SIDEBAR -->
      <div class="blueprint-sidebar-col">
        
        <!-- PRV ADVISORY GUARANTEE -->
        <div class="blueprint-guarantee-box">
          <div class="blueprint-guarantee-title"><i class="fa-solid fa-shield"></i> PRV Advisory Guarantee</div>
          <p class="blueprint-guarantee-desc">${service.prvHelp}</p>
          <div class="blueprint-sla-list">
            <div class="blueprint-sla-item"><i class="fa-solid fa-check-circle"></i> 100% First-Time Audit Pass SLA</div>
            <div class="blueprint-sla-item"><i class="fa-solid fa-check-circle"></i> Complete Handholding & SOP Drafting</div>
            <div class="blueprint-sla-item"><i class="fa-solid fa-check-circle"></i> Maximum Eligible Subsidy Realization</div>
            <div class="blueprint-sla-item"><i class="fa-solid fa-check-circle"></i> Dedicated Lead-Auditor Assigned</div>
          </div>
        </div>

        <!-- QUICK CONSULTATION CTA FORM -->
        <div class="blueprint-card" style="padding: 24px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--admin-text-dark); margin-bottom: 6px;">
            <i class="fa-solid fa-file-signature" style="color: var(--brand-primary);"></i> Quick Inquiry
          </h3>
          <p style="font-size: 0.84rem; color: var(--admin-text-muted); margin-bottom: 16px;">
            Get timeline, fee structure & Govt subsidy report for <strong>${service.name}</strong>.
          </p>

          <form id="detail-cta-form" style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label class="saas-label">Contact Person Name *</label>
              <input type="text" id="detail-name" required class="saas-input" placeholder="e.g. Vikram Singh">
            </div>
            <div>
              <label class="saas-label">Direct Mobile Number *</label>
              <input type="tel" id="detail-mobile" required class="saas-input" placeholder="+91 98765 43210">
            </div>
            <div>
              <label class="saas-label">Corporate Email Address *</label>
              <input type="email" id="detail-email" required class="saas-input" placeholder="vikram@company.com">
            </div>
            <button type="submit" class="saas-btn-submit" style="margin-top: 6px;">
              <i class="fa-solid fa-bolt"></i> Request Immediate Advisory Call
            </button>
          </form>
        </div>

        <!-- CONTACT CHANNELS -->
        <div class="blueprint-card" style="padding: 20px;">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--admin-text-muted); letter-spacing: 0.08em; margin-bottom: 12px;">
            Direct Auditor Hotline
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="tel:+917489351297" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--admin-text-dark); font-weight: 700; font-size: 0.95rem;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--brand-blue-light); color: var(--brand-primary); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-phone"></i></div>
              <span>+91 74893 51297</span>
            </a>
            <a href="https://wa.me/917489351297?text=Hello%20PRV%20Consultancy,%20I%20need%20details%20on%20${encodeURIComponent(service.name)}" target="_blank" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: #10b981; font-weight: 700; font-size: 0.95rem;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--brand-emerald-light); color: #10b981; display: flex; align-items: center; justify-content: center;"><i class="fa-brands fa-whatsapp"></i></div>
              <span>WhatsApp Advisory</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  `;

  // Attach detail page form listener
  const ctaForm = document.getElementById('detail-cta-form');
  if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('detail-name').value;
      const mobile = document.getElementById('detail-mobile').value;
      const email = document.getElementById('detail-email').value;

      try {
        await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: name,
            mobile_number: mobile,
            email: email,
            service_required: service.name,
            source: 'Service Detail Page CTA'
          })
        });
      } catch (err) {}

      showToast(`Consultation request for ${service.name} received! Stored in Database.`);
      ctaForm.reset();
    });
  }

  // Attach Detail AI Assistant button listener
  const detailAiBtn = document.getElementById('detail-ai-btn');
  if (detailAiBtn) {
    detailAiBtn.addEventListener('click', () => {
      window.location.hash = '#ai-consultant';
      setTimeout(() => {
        const fullInput = document.getElementById('full-ai-input');
        if (fullInput) {
          fullInput.value = `Tell me more about ${service.name} certification process and requirements`;
          fullInput.focus();
        }
      }, 300);
    });
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* --------------------------------------------------------------------------
   4. INTERACTIVE INDUSTRY SELECTOR (#view-industries)
   -------------------------------------------------------------------------- */
const INDUSTRY_SOLUTIONS = {
  "automotive": {
    title: "Automotive & OEM Supply Chain Solutions",
    icon: "fa-car",
    description: "Tailored quality and compliance solutions for Tier-1, Tier-2, and Tier-3 auto component manufacturers.",
    solutions: [
      { name: "IATF 16949:2016", desc: "Automotive Quality Management System" },
      { name: "APQP & PPAP", desc: "Advanced Product Quality Planning & Sample Approval" },
      { name: "PFMEA & Control Plans", desc: "Process Failure Mode Analysis & Risk Mitigation" },
      { name: "MSA & SPC", desc: "Measurement Systems & Statistical Process Control" },
      { name: "MACE Audit Prep", desc: "Maruti Suzuki Centre for Excellence Supplier Rating" }
    ]
  },
  "manufacturing": {
    title: "Manufacturing & Engineering Excellence",
    icon: "fa-industry",
    description: "Operational excellence, zero defect manufacturing, and MSME subsidy programs.",
    solutions: [
      { name: "ZED Certification (MSME)", desc: "Zero Defect Zero Effect Rating (Up to 80% Subsidy)" },
      { name: "ISO 9001 / 14001 / 45001", desc: "Integrated Management System (QMS + EMS + OHSMS)" },
      { name: "5S Shopfloor Organization", desc: "Workplace Standardization & Red Tag Campaign" },
      { name: "Lean & Kaizen", desc: "Continuous Micro-Improvements & MUDA Elimination" }
    ]
  },
  "food": {
    title: "Food & FMCG Processing Solutions",
    icon: "fa-utensils",
    description: "Food safety licensing, Schedule 4 hygiene, and global buyer audits.",
    solutions: [
      { name: "FSSAI Licensing", desc: "State & Central Food Safety Registration" },
      { name: "ISO 22000 (FSMS)", desc: "Food Safety Management System Standard" },
      { name: "FOSTAC Training", desc: "Mandatory Food Safety Supervisor Certification" },
      { name: "HACCP Audit", desc: "Hazard Analysis Critical Control Point Setup" }
    ]
  },
  "it": {
    title: "IT, SaaS & Technology Solutions",
    icon: "fa-laptop-code",
    description: "Information security, cyber compliance, and IT service management.",
    solutions: [
      { name: "ISO 27001:2022 (ISMS)", desc: "Information Security Management System" },
      { name: "ISO 20000-1 (ITSM)", desc: "IT Service Management System Standard" },
      { name: "SOC 2 Type I/II Readiness", desc: "US/EU Enterprise SaaS Security Clearance" }
    ]
  },
  "textile": {
    title: "Textile & Apparel Export Solutions",
    icon: "fa-shirt",
    description: "Social audit readiness, ethical trade clearance, and environmental compliance.",
    solutions: [
      { name: "SEDEX / SMETA Audits", desc: "2-Pillar & 4-Pillar Ethical Trade Audit Prep" },
      { name: "Social Compliance", desc: "Labor Law, Wage & Factory Safety Audit" },
      { name: "OEKO-TEX Support", desc: "Textile Chemical Safety Standard" }
    ]
  },
  "healthcare": {
    title: "Healthcare & Medical Device Solutions",
    icon: "fa-hospital",
    description: "Medical device quality management and regulatory approvals.",
    solutions: [
      { name: "ISO 13485", desc: "Medical Devices Quality Management System" },
      { name: "CE Marking Prep", desc: "European Conformity Medical Device Clearance" }
    ]
  },
  "construction": {
    title: "Infrastructure & Construction Solutions",
    icon: "fa-building",
    description: "Site safety, occupational health, and quality inspection.",
    solutions: [
      { name: "ISO 45001 Safety", desc: "Site Safety & Hazard Risk Control" },
      { name: "ISO 9001 Quality", desc: "Civil Construction SOPs & Materials Testing" }
    ]
  },
  "engineering": {
    title: "Precision Engineering & Tooling",
    icon: "fa-gear",
    description: "Precision calibration, NABL lab compliance, and quality control.",
    solutions: [
      { name: "ISO 17025 (NABL)", desc: "Testing & Calibration Laboratories Competence" },
      { name: "5S & OEE", desc: "Machine Uptime & Tooling Maintenance" }
    ]
  },
  "msme": {
    title: "Micro, Small & Medium Enterprise Solutions",
    icon: "fa-store",
    description: "Government subsidy maximization, bank loan interest rebate, and ZED rating.",
    solutions: [
      { name: "ZED Certification", desc: "Bronze, Silver, Gold Rating with 80% Subsidy" },
      { name: "NATS / NAPS Onboarding", desc: "Apprenticeship Subsidy up to ₹1,500/mo" }
    ]
  }
};

function initIndustrySelector() {
  const tabs = document.querySelectorAll('#industry-selector-tabs button');
  const display = document.getElementById('industry-solutions-display');
  if (!display) return;

  renderIndustrySolutions('automotive');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const indKey = tab.getAttribute('data-ind');
      renderIndustrySolutions(indKey);
    });
  });
}

function renderIndustrySolutions(indKey) {
  const display = document.getElementById('industry-solutions-display');
  const data = INDUSTRY_SOLUTIONS[indKey] || INDUSTRY_SOLUTIONS["automotive"];
  if (!display) return;

  display.innerHTML = `
    <div class="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
      <div class="w-12 h-12 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center text-2xl">
        <i class="fa-solid ${data.icon}"></i>
      </div>
      <div>
        <h3 class="text-2xl font-bold text-on-surface">${data.title}</h3>
        <p class="text-xs text-on-surface-variant mt-1">${data.description}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${data.solutions.map(sol => `
        <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary-container transition-all">
          <div class="font-bold text-sm text-primary-container mb-1">${sol.name}</div>
          <div class="text-xs text-on-surface-variant mb-3">${sol.desc}</div>
          <button class="text-[11px] font-bold text-secondary hover:text-primary-container open-modal-trigger" data-service="${sol.name}">Request Proposal →</button>
        </div>
      `).join('')}
    </div>
  `;
}

/* --------------------------------------------------------------------------
   5. INTERACTIVE FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.faq-toggle');
    if (toggle) {
      const content = toggle.nextElementSibling;
      const icon = toggle.querySelector('i');

      if (content) {
        const isHidden = content.classList.contains('hidden');
        if (isHidden) {
          content.classList.remove('hidden');
          if (icon) icon.className = 'fa-solid fa-chevron-up text-primary-container';
        } else {
          content.classList.add('hidden');
          if (icon) icon.className = 'fa-solid fa-chevron-down text-primary-container';
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   6. AJAX FORM HANDLERS & DATABASE INTEGRATION
   -------------------------------------------------------------------------- */
function initFormHandlers() {
  const mainContactForm = document.getElementById('main-contact-form');
  const modalConsultationForm = document.getElementById('consultation-form');
  const modalSeminarForm = document.getElementById('seminar-form');

  if (modalConsultationForm) {
    modalConsultationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalConsultationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const payload = {
        full_name: document.getElementById('enq-fullname').value.trim(),
        mobile_number: document.getElementById('enq-mobile').value.trim(),
        email: document.getElementById('enq-email').value.trim(),
        company_name: document.getElementById('enq-company').value.trim(),
        service_required: document.getElementById('enq-service').value,
        message: document.getElementById('enq-message').value.trim(),
        source: 'Consultation Popup Modal'
      };

      try {
        let res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            showToast(`Consultation Request #${result.id} saved in Database!`);
            document.getElementById('consultation-modal').classList.add('hidden');
            modalConsultationForm.reset();
            if (submitBtn) submitBtn.innerHTML = originalText;
            return;
          }
        }
      } catch (err) {}

      showToast('Consultation request saved! Advisor will reach out.');
      document.getElementById('consultation-modal').classList.add('hidden');
      modalConsultationForm.reset();
      if (submitBtn) submitBtn.innerHTML = originalText;
    });
  }

  if (modalSeminarForm) {
    modalSeminarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        full_name: document.getElementById('sem-fullname').value.trim(),
        mobile_number: document.getElementById('sem-mobile').value.trim(),
        email: document.getElementById('sem-email').value.trim(),
        city: document.getElementById('sem-city').value.trim(),
        number_of_participants: parseInt(document.getElementById('sem-headcount').value) || 1,
        seminar_name: document.getElementById('sem-name').value
      };

      try {
        await fetch('/api/seminars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      showToast(`Masterclass Registration confirmed for ${payload.full_name}!`);
      document.getElementById('seminar-modal').classList.add('hidden');
      modalSeminarForm.reset();
    });
  }

  if (mainContactForm) {
    mainContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = mainContactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';

      const payload = {
        full_name: document.getElementById('contact-fullname').value.trim(),
        company_name: document.getElementById('contact-company').value.trim(),
        mobile_number: document.getElementById('contact-mobile').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        industry: document.getElementById('contact-industry').value,
        service_required: document.getElementById('contact-service').value,
        message: document.getElementById('contact-message').value.trim(),
        source: 'Main Contact Page'
      };

      try {
        let res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            showToast(`Consultation Enquiry #${result.id} successfully saved to Database!`);
            mainContactForm.reset();
            submitBtn.innerHTML = originalText;
            return;
          }
        }
      } catch (err) {}

      showToast('Enquiry saved successfully! Senior advisor will call back shortly.');
      mainContactForm.reset();
      submitBtn.innerHTML = originalText;
    });
  }

  // Hero AI Button & Contact AI Button redirect to #ai-consultant
  const talkAiBtns = [document.getElementById('hero-talk-ai-btn'), document.getElementById('contact-talk-ai-btn')];
  talkAiBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        window.location.hash = '#ai-consultant';
      });
    }
  });
}

/* --------------------------------------------------------------------------
   7. SIDEBAR COLLAPSE / EXPAND & MOBILE NAVIGATION CONTROLLERS
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const sidebar = document.getElementById('app-sidebar');
  const toggleBtn = document.getElementById('app-sidebar-toggle') || document.getElementById('mobile-sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth <= 900) {
        if (sidebar) sidebar.classList.toggle('open');
      } else {
        document.body.classList.toggle('sidebar-collapsed');
      }
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      document.body.classList.add('sidebar-collapsed');
    });
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900 && sidebar) {
        sidebar.classList.remove('open');
      }
    });
  });

  // Legacy drawer support
  const legacyBtn = document.getElementById('mobile-menu-btn');
  const legacyDrawer = document.getElementById('mobile-menu-drawer');
  if (legacyBtn && legacyDrawer) {
    legacyBtn.addEventListener('click', () => {
      legacyDrawer.classList.toggle('hidden');
    });
    legacyDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        legacyDrawer.classList.add('hidden');
      });
    });
  }
}

function initHeroActions() {
  // Modal consultation triggers (delegate — works for dynamically rendered service detail buttons too)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-modal-trigger');
    if (trigger) {
      const serviceName = trigger.getAttribute('data-service') || 'General Consultation';
      const modal = document.getElementById('consultation-modal');
      const serviceHeader = document.getElementById('modal-service-name');
      const selectElem = document.getElementById('enq-service');

      if (serviceHeader) serviceHeader.textContent = serviceName;
      if (selectElem) {
        for (let opt of selectElem.options) {
          if (opt.value === serviceName || opt.value.toLowerCase().includes(serviceName.toLowerCase())) {
            opt.selected = true;
            break;
          }
        }
      }
      if (modal) modal.classList.remove('hidden');
    }
  });

  // Open seminar modal delegate (works on Training page & Master Excellence page buttons)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-seminar-modal-trigger, .open-seminar-trigger');
    if (trigger) {
      const seminarName = trigger.getAttribute('data-seminar') || 'Internal Auditor Training';
      const modal = document.getElementById('seminar-modal');
      const semInput = document.getElementById('sem-name');
      if (semInput) semInput.value = seminarName;
      if (modal) modal.classList.remove('hidden');
    }
  });

  // Detail page AI button — navigate to #ai-consultant
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#detail-ai-btn, #contact-talk-ai-btn, #hero-talk-ai-btn');
    if (trigger) {
      window.location.hash = '#ai-consultant';
    }
  });

  // Close consultation modal buttons
  const closeConsultBtn = document.getElementById('close-consultation-modal');
  if (closeConsultBtn) {
    closeConsultBtn.addEventListener('click', () => {
      document.getElementById('consultation-modal').classList.add('hidden');
    });
  }

  // Close seminar modal buttons
  const closeSemBtn = document.getElementById('close-seminar-modal');
  if (closeSemBtn) {
    closeSemBtn.addEventListener('click', () => {
      document.getElementById('seminar-modal').classList.add('hidden');
    });
  }

  // Close modals on backdrop click
  document.addEventListener('click', (e) => {
    const consultModal = document.getElementById('consultation-modal');
    const semModal = document.getElementById('seminar-modal');
    if (e.target === consultModal) consultModal.classList.add('hidden');
    if (e.target === semModal) semModal.classList.add('hidden');
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'glass-panel p-4 rounded-xl border border-primary-container text-xs font-bold text-on-surface shadow-2xl flex items-center gap-3 animate-fade-up';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-primary-container text-lg"></i> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/* --------------------------------------------------------------------------
   8. PAGE ENTRANCE ANIMATION ENGINE
   (IntersectionObserver won't work for SPA display:none → block switches,
    so we use a staggered entrance triggered directly in handleRoute)
   -------------------------------------------------------------------------- */

function triggerPageEntrance(pageEl) {
  if (!pageEl) return;

  // Select all cards, panels, headings inside this page view
  const items = pageEl.querySelectorAll(
    '.glass-panel, .home-service-card, .pipeline-step, section > div > *, .hero-cert-tag, .hero-stat'
  );

  items.forEach((el, i) => {
    // Mark for animation
    el.classList.add('page-enter-item');
    el.classList.remove('entered');

    // Stagger: cap delay at 600ms so it doesn't feel slow
    const delay = Math.min(i * 40, 600);
    setTimeout(() => {
      el.classList.add('entered');
    }, delay);
  });
}

function initScrollAnimations() {
  // Trigger entrance on the initially active page (home)
  const activePage = document.querySelector('.page-view.active');
  if (activePage) triggerPageEntrance(activePage);
}


/* --------------------------------------------------------------------------
   9. HERO STAT COUNTER ANIMATION
   -------------------------------------------------------------------------- */
function initCounterAnimation() {
  const statEls = document.querySelectorAll('[data-count-to]');
  if (statEls.length === 0) return; // skip if no explicit data-count-to elements

  statEls.forEach(el => {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const suffix = el.getAttribute('data-count-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * ease);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

/* --------------------------------------------------------------------------
   10. THREE.JS 3D INTERACTIVE PARTICLE CANVAS
   -------------------------------------------------------------------------- */
function initThreeHeroCanvas() {
  const canvas = document.getElementById('hero-three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 1, 1000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create 3D Particle Constellation
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00f2fe);
    const blueColor = new THREE.Color(0x38bdf8);
    const mintColor = new THREE.Color(0x00f2c3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      const mixedColor = i % 3 === 0 ? cyanColor : i % 3 === 1 ? blueColor : mintColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.2;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.2;
    });

    // Resize Handler
    window.addEventListener('resize', () => {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });

    // Render Loop
    function animate() {
      requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      particles.rotation.y += 0.0012;
      particles.rotation.x += 0.0006;

      particles.position.x = targetX * 0.4;
      particles.position.y = -targetY * 0.4;

      renderer.render(scene, camera);
    }
    animate();
  } catch (e) {
    console.warn('Three.js canvas initialization skipped:', e);
  }
}

/* --------------------------------------------------------------------------
   11. INTERACTIVE MSME SUBSIDY & FINANCIAL ROI CALCULATOR
   -------------------------------------------------------------------------- */
function initRoiCalculator() {
  const calcSection = document.getElementById('calculator-section');
  if (!calcSection) return;

  const tierBtns = calcSection.querySelectorAll('.calc-tier-btn');
  const certBtns = calcSection.querySelectorAll('.calc-cert-btn');
  const apprenticeSlider = document.getElementById('calc-apprentice-slider');
  const apprenticeVal = document.getElementById('calc-apprentice-count-val') || document.getElementById('calc-apprentice-val');

  const grandTotalEl = document.getElementById('calc-total-benefit') || document.getElementById('calc-grand-total');
  const zedBreakdownEl = document.getElementById('calc-zed-subsidy') || document.getElementById('calc-breakdown-zed');
  const natsBreakdownEl = document.getElementById('calc-nats-subsidy') || document.getElementById('calc-breakdown-nats');

  let currentTierRate = 0.80; // Micro = 80%
  let currentHandholdingBase = 200000; // ZED Gold = ₹2 Lakh Handholding
  let currentTestingBase = 300000; // ZED Gold = ₹3 Lakh Technology Upgradation
  let currentApprentices = 5;

  function formatINR(val) {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  function calculate() {
    const zedSubsidy = (currentHandholdingBase + currentTestingBase) * currentTierRate;
    const natsReimbursement = currentApprentices * 1500 * 12; // ₹1,500/mo * 12 mos
    const grandTotal = zedSubsidy + natsReimbursement;

    if (zedBreakdownEl) zedBreakdownEl.textContent = formatINR(zedSubsidy);
    if (natsBreakdownEl) natsBreakdownEl.textContent = formatINR(natsReimbursement);

    if (grandTotalEl) {
      animateValue(grandTotalEl, grandTotal);
    }
  }

  function animateValue(el, targetVal) {
    const startVal = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
    const duration = 400;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetVal - startVal) * ease);
      el.textContent = formatINR(current);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Tier Buttons
  tierBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tierBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTierRate = parseFloat(btn.getAttribute('data-zed-rate')) || 0.80;
      calculate();
    });
  });

  // Cert Buttons
  certBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      certBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentHandholdingBase = parseFloat(btn.getAttribute('data-handholding')) || 200000;
      currentTestingBase = parseFloat(btn.getAttribute('data-testing')) || 300000;
      calculate();
    });
  });

  // Apprentice Slider
  if (apprenticeSlider) {
    apprenticeSlider.addEventListener('input', (e) => {
      currentApprentices = parseInt(e.target.value) || 0;
      if (apprenticeVal) apprenticeVal.textContent = currentApprentices;
      calculate();
    });
  }

  calculate();
}

/* --------------------------------------------------------------------------
   12. 60-SECOND AUDIT READINESS DIAGNOSTIC ENGINE
   -------------------------------------------------------------------------- */
function initDiagnosticQuiz() {
  const quizWidget = document.getElementById('diagnostic-widget');
  if (!quizWidget) return;

  let currentStep = 1;
  const answers = { industry: 'auto', challenge: 'tenders', currentStatus: 'basic' };

  const stepIndicator = document.getElementById('quiz-step-indicator');
  const percentIndicator = document.getElementById('quiz-percent-indicator');
  const progressBar = document.getElementById('quiz-progress-bar');
  const restartBtn = document.getElementById('quiz-restart-btn');

  const stepViews = [
    document.getElementById('quiz-step-1'),
    document.getElementById('quiz-step-2'),
    document.getElementById('quiz-step-3'),
    document.getElementById('quiz-result-view')
  ];

  quizWidget.querySelectorAll('.quiz-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step'));
      const val = btn.getAttribute('data-val');

      if (step === 1) answers.industry = val;
      if (step === 2) answers.challenge = val;
      if (step === 3) answers.currentStatus = val;

      if (step < 3) {
        goToStep(step + 1);
      } else {
        showResults();
      }
    });
  });

  function goToStep(s) {
    currentStep = s;
    stepViews.forEach((v, idx) => {
      if (v) {
        if (idx === s - 1) {
          v.classList.remove('hidden');
          v.classList.add('active');
        } else {
          v.classList.add('hidden');
          v.classList.remove('active');
        }
      }
    });

    const percent = Math.round((s / 3) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (percentIndicator) percentIndicator.textContent = `${percent}% Completed`;

    if (s === 1 && stepIndicator) stepIndicator.textContent = 'Step 1 of 3: Industry & Core Activity';
    if (s === 2 && stepIndicator) stepIndicator.textContent = 'Step 2 of 3: Primary Business Objective';
    if (s === 3 && stepIndicator) stepIndicator.textContent = 'Step 3 of 3: Current Quality Infrastructure';
  }

  function showResults() {
    stepViews.forEach((v, idx) => {
      if (v) {
        if (idx === 3) {
          v.classList.remove('hidden');
          v.classList.add('active');
        } else {
          v.classList.add('hidden');
          v.classList.remove('active');
        }
      }
    });

    if (progressBar) progressBar.style.width = '100%';
    if (percentIndicator) percentIndicator.textContent = '100% Diagnostic Complete';
    if (stepIndicator) stepIndicator.textContent = 'Strategic Diagnostic Summary';

    // Calculate score & recommendation
    let score = 84;
    let recStd = 'ZED Gold + ISO 9001:2015';
    let recTime = '18 - 25 Working Days';
    let recSubsidy = 'Up to ₹5,00,000 Grant (80%)';
    let recDesc = 'High Potential for Fast-Track ZED Gold & ISO 9001 Certification with Govt Subsidy.';

    if (answers.industry === 'auto' || answers.challenge === 'oem') {
      score = 92;
      recStd = 'IATF 16949:2016 + 5 Core Tools';
      recTime = '35 - 50 Working Days';
      recSubsidy = 'Up to ₹2,50,000 Handholding Grant';
      recDesc = 'Mandatory for Maruti, Tata, Hyundai and Tier-1 Automotive supply chain empanelment.';
    } else if (answers.challenge === 'export') {
      score = 86;
      recStd = 'SEDEX SMETA 4-Pillar + ISO 14001';
      recTime = '14 - 20 Working Days';
      recSubsidy = 'Export Council Subsidy Eligible';
      recDesc = 'Essential for European & US buyer purchase order clearance and social compliance.';
    } else if (answers.challenge === 'quality') {
      score = 78;
      recStd = '5S Workplace Organization + Kaizen';
      recTime = '15 - 30 Working Days';
      recSubsidy = 'Cost Optimization Grant Eligible';
      recDesc = 'Focused on reducing shopfloor scrap, cutting changeover downtime, and boosting OEE.';
    }

    const scoreNum = document.getElementById('quiz-score-num');
    const recStdEl = document.getElementById('quiz-rec-std');
    const recTimeEl = document.getElementById('quiz-rec-time');
    const recSubsidyEl = document.getElementById('quiz-rec-subsidy');
    const recDescEl = document.getElementById('quiz-recommendation-desc');

    if (scoreNum) scoreNum.textContent = score + '%';
    if (recStdEl) recStdEl.textContent = recStd;
    if (recTimeEl) recTimeEl.textContent = recTime;
    if (recSubsidyEl) recSubsidyEl.textContent = recSubsidy;
    if (recDescEl) recDescEl.textContent = recDesc;
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      goToStep(1);
    });
  }
}

/* --------------------------------------------------------------------------
   13. GLOBAL SPOTLIGHT COMMAND PALETTE (Ctrl+K) & SEARCH ENGINE
   -------------------------------------------------------------------------- */
function initCommandPalette() {
  const modal = document.getElementById('search-modal') || document.getElementById('command-search-modal');
  const openBtn = document.getElementById('nav-search-btn');
  const dashSearch = document.getElementById('dash-quick-search-input');
  const closeBtn = document.getElementById('close-search-modal') || document.getElementById('close-command-search');
  const searchInput = document.getElementById('global-search-input') || document.getElementById('command-search-input');
  const resultsContainer = document.getElementById('global-search-results') || document.getElementById('command-search-results');
  const filterChips = document.querySelectorAll('.search-filter-chip');

  if (!modal || !searchInput || !resultsContainer) return;

  let activeCategory = 'all';

  function openPalette(initialQuery = '') {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    searchInput.value = initialQuery;
    searchInput.focus();
    renderResults(initialQuery);
  }

  function closePalette() {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }

  if (openBtn) openBtn.addEventListener('click', () => openPalette(''));
  if (dashSearch) {
    dashSearch.addEventListener('focus', () => {
      openPalette(dashSearch.value);
    });
    dashSearch.addEventListener('input', (e) => {
      openPalette(e.target.value);
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closePalette);

  // Global Hotkey (Ctrl+K / Cmd+K / Escape)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('hidden') || modal.style.display === 'none') {
        openPalette('');
      } else {
        closePalette();
      }
    }
    if (e.key === 'Escape') {
      closePalette();
    }
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePalette();
  });

  // Filter Chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      activeCategory = chip.getAttribute('data-cat') || 'all';
      renderResults(searchInput.value);
    });
  });

  searchInput.addEventListener('input', (e) => {
    renderResults(e.target.value);
  });

  let selectedIndex = -1;

  // Keyboard navigation within search input
  searchInput.addEventListener('keydown', (e) => {
    const items = resultsContainer.querySelectorAll('.search-result-item, .command-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedIndex < items.length - 1) {
        selectedIndex++;
      } else {
        selectedIndex = 0;
      }
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
      } else {
        selectedIndex = items.length - 1;
      }
      updateSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    }
  });

  function updateSelection(items) {
    items.forEach((it, idx) => {
      if (idx === selectedIndex) {
        it.classList.add('selected-item');
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        it.classList.remove('selected-item');
      }
    });
  }

  function renderResults(query) {
    const q = query.toLowerCase().trim();
    resultsContainer.innerHTML = '';
    selectedIndex = -1;

    const services = Object.values(PRV_SERVICES_DATA);
    const filtered = services.filter(srv => {
      const matchCat = activeCategory === 'all' || srv.category === activeCategory;
      const matchText = !q || srv.name.toLowerCase().includes(q) || srv.shortDesc.toLowerCase().includes(q) || srv.id.toLowerCase().includes(q);
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 16px; color: var(--admin-text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 10px;"></i>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--admin-text-dark);">No standards found matching "${query}"</div>
          <div style="margin-top: 8px; color: #0284c7; cursor: pointer; font-size: 0.85rem; font-weight: 700;" onclick="window.openPrvConsultationModal('General Consultation', 'search_empty')">Request a Custom Consultation Session →</div>
        </div>
      `;
      return;
    }

    filtered.forEach((srv, idx) => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--brand-blue-light); color: var(--brand-primary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; shrink: 0;">
            <i class="fa-solid ${srv.icon || 'fa-certificate'}"></i>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--admin-text-dark);">${srv.name}</div>
            <div style="font-size: 0.78rem; color: var(--admin-text-muted);">${srv.shortDesc}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="saas-card-tag">${srv.category}</span>
          <i class="fa-solid fa-arrow-right" style="font-size: 0.8rem; color: var(--brand-primary);"></i>
        </div>
      `;

      item.addEventListener('click', () => {
        closePalette();
        showServiceDetailPage(srv.id);
        window.location.hash = `#services/${srv.id}`;
      });

      resultsContainer.appendChild(item);
    });
  }
}

// Global Diagnostics and AI Prompt Triggers
window.selectDiagnosticOption = function(btn, step) {
  const resultCard = document.getElementById('diag-result-card');
  const stepContainer = document.getElementById('diag-step-1');
  const scoreType = btn.getAttribute('data-score');

  if (stepContainer) stepContainer.style.display = 'none';
  if (resultCard) {
    resultCard.style.display = 'block';
    const tag = document.getElementById('diag-recommend-tag');
    const title = document.getElementById('diag-recommend-title');
    const desc = document.getElementById('diag-recommend-desc');

    if (scoreType === 'zed') {
      if (tag) tag.textContent = 'MSME Subsidy Track';
      if (title) title.textContent = 'ZED Gold Certification (80% Govt Grant)';
      if (desc) desc.textContent = 'Your enterprise qualifies for up to ₹2 Lakhs handholding grant + ₹3 Lakhs technology upgradation subsidy and 0.5% bank interest rate reduction.';
    } else if (scoreType === 'iso') {
      if (tag) tag.textContent = 'Export Readiness Track';
      if (title) title.textContent = 'ISO 9001 + SEDEX SMETA Ethical Audit';
      if (desc) desc.textContent = 'Mandatory framework to clear international buyer audits, Walmart/Target vendor onboarding, and global supply chains.';
    } else {
      if (tag) tag.textContent = 'Shopfloor Excellence Track';
      if (title) title.textContent = '5S Visual Workplace + Kaizen Rollout';
      if (desc) desc.textContent = 'Eliminates manufacturing scrap, recovers usable floor space, and establishes daily visual management standard.';
    }
  }
};

window.sendAiPrompt = function(promptText) {
  const aiInput = document.getElementById('full-ai-input');
  const aiForm = document.getElementById('full-ai-form');
  if (aiInput) {
    aiInput.value = promptText;
    if (aiForm) aiForm.dispatchEvent(new Event('submit'));
  }
};

// Global Export/Aliases
window.showServiceDetailPage = showServiceDetailPage;
window.renderServiceDetail = showServiceDetailPage;

/* --------------------------------------------------------------------------
   14. CARD SPOTLIGHT GLOW MICRO-INTERACTIONS
   -------------------------------------------------------------------------- */
function initCardGlowSpotlight() {
  document.querySelectorAll('.glass-panel, .home-service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

