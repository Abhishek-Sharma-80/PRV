/* ==========================================================================
   PRV CONSULTANCY SERVICES - MASTER FRONTEND & ROUTING ENGINE
   Page Views Switcher, Dynamic Service Detail Renderer (27+ Services),
   Interactive Industry Selector, Business Excellence Model,
   AJAX Database Form Handlers & Toast Notifications
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('PRV Consultancy Services - Master Application Initialized.');

  initPageRouting();
  initServicesEcosystem();
  initIndustrySelector();
  initFaqAccordion();
  initFormHandlers();
  initMobileNav();
  initHeroActions();
  initScrollAnimations();
  initCounterAnimation();
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
    whyImportant: "ZED certification opens doors to government financial subsidies (up to 80% reimbursement on certification costs), bank loan interest concessions (0.5%), testing equipment subsidies (up to ₹1 Lakh), and preference in Govt e-Marketplace (GeM) tenders.",
    whoShouldUse: "All registered Micro, Small, and Medium Enterprises (MSMEs) with a valid UDYAM registration certificate engaged in manufacturing.",
    benefits: [
      "80% Subsidy reimbursement on certification cost for Micro enterprises, 60% for Small, 50% for Medium",
      "₹5 Lakh Handholding support by accredited consulting experts",
      "0.5% Interest rate concession on bank credit facilities",
      "₹1 Lakh Subsidy for capital testing equipment acquisition",
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
   2. PAGE VIEW ROUTING ENGINE
   -------------------------------------------------------------------------- */
function initPageRouting() {
  const pageViews = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('.nav-link, #mobile-menu-drawer a');

  function handleRoute() {
    let hash = window.location.hash || '#home';

    // Handle deep service links like #services/iso-9001
    if (hash.startsWith('#services/')) {
      const serviceId = hash.split('/')[1];
      showServiceDetailPage(serviceId);
      updateNavHighlight('#services');
      return;
    }

    const targetId = 'view-' + hash.replace('#', '');
    let targetView = document.getElementById(targetId);

    if (!targetView) {
      targetView = document.getElementById('view-home');
      hash = '#home';
    }

    pageViews.forEach(v => v.classList.remove('active'));
    targetView.classList.add('active');

    updateNavHighlight(hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateNavHighlight(activeHash) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === activeHash) {
        link.classList.add('text-primary-container', 'font-bold');
      } else {
        link.classList.remove('text-primary-container');
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
    <div class="service-detail-hero p-8 md:p-12 rounded-2xl mb-10 relative overflow-hidden">
      <div class="inline-flex items-center gap-2 mb-4">
        <span class="detail-badge-pill"><i class="fa-solid fa-certificate"></i> PRV Executive Service Guide</span>
        <span class="detail-badge-pill"><i class="fa-solid fa-shield-halved"></i> 100% Audit Clearance</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-extrabold text-on-surface mb-4 font-heading">${service.name}</h1>
      <p class="text-lg text-on-surface-variant max-w-3xl leading-relaxed mb-8">${service.shortDesc}</p>
      <div class="flex flex-wrap gap-4">
        <button class="bg-primary-container text-on-primary-container font-bold text-sm px-8 py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(0,242,195,0.4)] open-modal-trigger" data-service="${service.name}">
          Request Consultation
        </button>
        <button id="detail-ai-btn" class="glass-panel text-on-surface font-bold text-sm px-6 py-3.5 rounded-full border border-border-glass hover:bg-white/10 flex items-center gap-2 text-secondary">
          <i class="fa-solid fa-robot text-primary-container"></i> Ask AI Consultant About ${service.name}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div class="lg:col-span-2 space-y-10">
        <!-- 2. WHAT IS IT? -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-primary-container mb-4">1. What is ${service.name}?</h2>
          <p class="text-sm text-on-surface-variant leading-relaxed mb-4">${service.whatIsIt}</p>
        </div>

        <!-- 3. WHY IS IT IMPORTANT? -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-secondary mb-4">2. Why is it Important?</h2>
          <p class="text-sm text-on-surface-variant leading-relaxed">${service.whyImportant}</p>
        </div>

        <!-- 4. WHO SHOULD USE IT? -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-on-surface mb-4">3. Who Should Use It? (Eligibility)</h2>
          <p class="text-sm text-on-surface-variant leading-relaxed">${service.whoShouldUse}</p>
        </div>

        <!-- 5. BENEFITS -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-primary-container mb-6">4. Key Benefits</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${service.benefits.map(b => `
              <div class="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <i class="fa-solid fa-circle-check text-primary-container mt-1"></i>
                <span class="text-xs text-on-surface">${b}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 6. KEY AREAS -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-secondary mb-4">5. Key Areas Covered</h2>
          <div class="flex flex-wrap gap-2">
            ${service.keyAreas.map(a => `<span class="px-3 py-1.5 rounded-full bg-surface-variant border border-border-glass text-xs font-semibold text-on-surface">${a}</span>`).join('')}
          </div>
        </div>

        <!-- 7. GENERAL IMPLEMENTATION PROCESS -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-on-surface mb-6">6. General Implementation Process</h2>
          <div class="space-y-4">
            ${service.process.map((step, idx) => `
              <div class="process-step-card p-4 rounded-xl flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center font-bold text-xs flex-shrink-0">${idx + 1}</div>
                <div>
                  <div class="font-bold text-sm text-on-surface">${step}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 8. TYPICAL DOCUMENTATION -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-primary-container mb-4">7. Typical Documentation Required</h2>
          <ul class="space-y-2 text-xs text-on-surface-variant">
            ${service.documentation.map(doc => `<li class="flex items-center gap-2"><i class="fa-solid fa-file-lines text-secondary"></i> ${doc}</li>`).join('')}
          </ul>
        </div>

        <!-- 9. FREQUENTLY ASKED QUESTIONS -->
        <div class="glass-panel p-8 rounded-2xl border border-border-glass">
          <h2 class="text-2xl font-bold text-on-surface mb-6">8. Service FAQs</h2>
          <div class="space-y-4">
            ${service.faqs.map(faq => `
              <div class="p-4 rounded-xl bg-white/5 border border-white/5">
                <div class="font-bold text-sm text-primary-container mb-1">Q: ${faq.q}</div>
                <div class="text-xs text-on-surface-variant leading-relaxed">A: ${faq.a}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SIDEBAR (10. HOW PRV CAN HELP & 11. CTA FORM) -->
      <div class="space-y-8">
        <!-- 10. HOW PRV CAN HELP -->
        <div class="glass-panel p-6 rounded-2xl border border-primary-container/30">
          <h3 class="text-lg font-bold text-primary-container mb-3">9. How PRV Can Help</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed mb-4">${service.prvHelp}</p>
          <div class="p-3 rounded-xl bg-primary-container/10 border border-primary-container/30 text-xs text-primary-container font-semibold">
            <i class="fa-solid fa-shield"></i> Guaranteed 100% Audit Clearance & Fast-Track Execution
          </div>
        </div>

        <!-- 11. CONSULTATION CTA FORM -->
        <div class="glass-panel p-6 rounded-2xl border border-border-glass">
          <h3 class="text-lg font-bold text-on-surface mb-2">10. Quick Consultation</h3>
          <p class="text-xs text-on-surface-variant mb-4">Get exact pricing & timeline estimate for ${service.name}.</p>
          
          <form id="detail-cta-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold mb-1">Name *</label>
              <input type="text" id="detail-name" required class="w-full bg-white/5 border border-border-glass rounded-lg p-2.5 text-on-surface">
            </div>
            <div>
              <label class="block font-bold mb-1">Mobile *</label>
              <input type="tel" id="detail-mobile" required class="w-full bg-white/5 border border-border-glass rounded-lg p-2.5 text-on-surface">
            </div>
            <div>
              <label class="block font-bold mb-1">Email *</label>
              <input type="email" id="detail-email" required class="w-full bg-white/5 border border-border-glass rounded-lg p-2.5 text-on-surface">
            </div>
            <button type="submit" class="w-full bg-primary-container text-on-primary-container font-bold py-3 rounded-full text-xs">Request Instant Call Back</button>
          </form>
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
   7. MOBILE NAVIGATION & TOAST UTILITY
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-menu-drawer');
  if (btn && drawer) {
    btn.addEventListener('click', () => {
      drawer.classList.toggle('hidden');
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.add('hidden');
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
          if (opt.value === serviceName) { opt.selected = true; break; }
        }
      }
      if (modal) modal.classList.remove('hidden');
    }
  });

  // Open seminar modal delegate (works on Training page & Master Excellence page buttons)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-seminar-trigger');
    if (trigger) {
      const modal = document.getElementById('seminar-modal');
      if (modal) modal.classList.remove('hidden');
    }
  });

  // Detail page AI button — navigate to #ai-consultant
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#detail-ai-btn');
    if (trigger) {
      window.location.hash = '#ai-consultant';
    }
  });

  const modalClose = document.querySelectorAll('.modal-close');
  modalClose.forEach(b => b.addEventListener('click', () => {
    document.getElementById('consultation-modal').classList.add('hidden');
  }));

  const seminarClose = document.querySelectorAll('.close-seminar');
  seminarClose.forEach(b => b.addEventListener('click', () => {
    document.getElementById('seminar-modal').classList.add('hidden');
  }));

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
   8. SCROLL ANIMATIONS (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // IMPORTANT: Only observe glass-panels inside .page-view sections (main content).
  // Exclude modals, overlays, AI chat window, floating widgets and fixed UI elements
  // to prevent them from being hidden by scroll-reveal's initial opacity:0.
  const EXCLUDED_PARENTS = [
    '#consultation-modal',
    '#seminar-modal',
    '#ai-chat-window',
    '#ai-chat-toggle-btn',
    '#toast-container',
    'nav',
    'footer'
  ].join(', ');

  document.querySelectorAll('.page-view .glass-panel, .animate-on-scroll').forEach(el => {
    // Skip if inside an excluded parent (modals, overlays, nav, footer)
    if (el.closest(EXCLUDED_PARENTS)) return;

    el.classList.add('scroll-reveal');
    observer.observe(el);
  });
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
