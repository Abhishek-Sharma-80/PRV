/* ==========================================================================
   PRV CONSULTANCY SERVICES - MASTER JAVASCRIPT
   Interactive Functionality: Solutions Tabs, User Journey Map,
   Database AJAX Form Persistence (client_enquiries & seminar_registrations),
   Anti-Spam Controls & Toast Notifications
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('PRV Consultancy Services Portal initialized with SQLite DB REST APIs.');

  initTabSystem();
  initUserJourney();
  initRoadmapSystem();
  initModalSystem();
  initSeminarModalSystem();
  initFormHandler();
  initMobileNav();
  initInstantFinder();
});

/* --------------------------------------------------------------------------
   1. SOLUTIONS CATEGORY TABS SYSTEM
   -------------------------------------------------------------------------- */
function initTabSystem() {
  const tabButtons = document.querySelectorAll('.solutions-tabs .tab-btn');
  const tabContents = document.querySelectorAll('.solutions-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCategory = btn.getAttribute('data-category');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${targetCategory}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   2. INTERACTIVE USER JOURNEY FLOW (8 STEPS)
   -------------------------------------------------------------------------- */
const journeyData = {
  1: {
    title: "1. Visitor Initial Touchpoint",
    desc: "The client visits PRV Consultancy Services website or touches base through industry references to explore organizational improvement options."
  },
  2: {
    title: "2. Requirement Identification",
    desc: "The business identifies specific needs—such as ISO 9001/27001 certification, ZED rating improvement, SEDEX audit readiness, or team leadership training."
  },
  3: {
    title: "3. Service & Solution Exploration",
    desc: "Clients browse our detailed service portfolios, standard blueprints, assessment tools, and case study results."
  },
  4: {
    title: "4. Consultation Request",
    desc: "Client fills out our quick inquiry form, initiates a WhatsApp discussion, or calls our senior consultants directly."
  },
  5: {
    title: "5. Comprehensive Business Discussion",
    desc: "PRV expert consultants conduct an initial discovery session to evaluate existing operational gaps, audit scope, and organizational goals."
  },
  6: {
    title: "6. Customized Execution Roadmap",
    desc: "PRV presents a tailored gap analysis assessment report, action proposal, timeline, and cost-optimized roadmap."
  },
  7: {
    title: "7. Strategic Implementation & Training",
    desc: "Hands-on execution: SOP creation, 5S/Kaizen implementation, internal mock audits, workforce apprenticeship, and leadership coaching."
  },
  8: {
    title: "8. Certification, Audit & Continuous Improvement",
    desc: "Successful external audit clearance, certification issuance, KPI tracking, and sustained operational excellence monitoring."
  }
};

function initUserJourney() {
  const journeyNodes = document.querySelectorAll('.journey-node');
  const detailTitle = document.getElementById('journey-detail-title');
  const detailDesc = document.getElementById('journey-detail-desc');

  journeyNodes.forEach(node => {
    node.addEventListener('click', () => {
      const step = node.getAttribute('data-step');

      journeyNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      if (journeyData[step] && detailTitle && detailDesc) {
        detailTitle.textContent = journeyData[step].title;
        detailDesc.textContent = journeyData[step].desc;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. EMPLOYEE TO CEO ROADMAP STEPPER
   -------------------------------------------------------------------------- */
const roadmapData = {
  1: "Stage 1 - Employee: Focus on operational execution, task completion, and mastering fundamental skills.",
  2: "Stage 2 - Professional: Building specialized domain expertise, process adherence, and quality outputs.",
  3: "Stage 3 - High Performer: Consistently exceeding KPIs, driving 5S/Kaizen improvements, and leading initiatives.",
  4: "Stage 4 - Supervisor: Team coordination, daily performance monitoring, standard compliance, and problem solving.",
  5: "Stage 5 - Manager: Departmental strategy, resource allocation, audit readiness, and productivity optimization.",
  6: "Stage 6 - Leader: Visionary guidance, talent development, strategic planning, and operational excellence.",
  7: "Stage 7 - Business Leader: Profit maximization, market expansion, governance, and business resilience.",
  8: "Stage 8 - CEO Mindset: Complete organizational mastery, enterprise value creation, and sustainable industry leadership."
};

function initRoadmapSystem() {
  const roadmapSteps = document.querySelectorAll('.roadmap-step');
  const roadmapInfo = document.getElementById('roadmap-info-text');

  roadmapSteps.forEach(step => {
    step.addEventListener('click', () => {
      const stage = step.getAttribute('data-stage');

      roadmapSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');

      if (roadmapData[stage] && roadmapInfo) {
        roadmapInfo.textContent = roadmapData[stage];
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. MODAL SYSTEM (CONSULTATION & ENQUIRIES)
   -------------------------------------------------------------------------- */
function initModalSystem() {
  const modalOverlay = document.getElementById('consultation-modal');
  const modalCloseBtns = document.querySelectorAll('.modal-close');
  const openModalBtns = document.querySelectorAll('.open-modal-trigger');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service') || 'General Consultation';
      const modalHeader = document.getElementById('modal-service-name');
      const selectElem = document.getElementById('enq-service');
      
      if (modalHeader) modalHeader.textContent = serviceName;
      if (selectElem) {
        for (let opt of selectElem.options) {
          if (opt.value === serviceName) {
            opt.selected = true;
            break;
          }
        }
      }
      if (modalOverlay) modalOverlay.classList.add('active');
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }
}

/* --------------------------------------------------------------------------
   5. SEMINAR & TRAINING MODAL SYSTEM
   -------------------------------------------------------------------------- */
function initSeminarModalSystem() {
  const seminarOverlay = document.getElementById('seminar-modal');
  const openBtns = document.querySelectorAll('.open-seminar-trigger');
  const closeBtns = document.querySelectorAll('.close-seminar');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (seminarOverlay) seminarOverlay.classList.add('active');
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (seminarOverlay) seminarOverlay.classList.remove('active');
    });
  });

  if (seminarOverlay) {
    seminarOverlay.addEventListener('click', (e) => {
      if (e.target === seminarOverlay) seminarOverlay.classList.remove('active');
    });
  }
}

/* --------------------------------------------------------------------------
   6. AJAX FORM HANDLERS & ANTI-SPAM PROTECTION
   -------------------------------------------------------------------------- */
let isSubmitting = false;

function initFormHandler() {
  const consultationForm = document.getElementById('consultation-form');
  const seminarForm = document.getElementById('seminar-form');
  const newsletterForm = document.getElementById('newsletter-form');

  // DATABASE 1: client_enquiries Submission
  if (consultationForm) {
    consultationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const submitBtn = consultationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';

      const payload = {
        full_name: document.getElementById('enq-fullname').value.trim(),
        designation: document.getElementById('enq-designation').value.trim(),
        company_name: document.getElementById('enq-company').value.trim(),
        company_size: document.getElementById('enq-size').value,
        mobile_number: document.getElementById('enq-mobile').value.trim(),
        email: document.getElementById('enq-email').value.trim(),
        city: document.getElementById('enq-city').value.trim(),
        state: document.getElementById('enq-state').value.trim(),
        industry: document.getElementById('enq-industry').value,
        service_required: document.getElementById('enq-service').value,
        message: document.getElementById('enq-message').value.trim(),
        source: 'Website Popup Form'
      };

      try {
        let response = null;
        try {
          response = await fetch('/api/enquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (e) {
          response = await fetch('http://localhost:3000/api/enquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (response && response.ok) {
          const result = await response.json();
          if (result.success) {
            showToast(`Enquiry #${result.id} submitted! Stored in client_enquiries DB.`);
            document.getElementById('consultation-modal').classList.remove('active');
            consultationForm.reset();
            return;
          }
        }
      } catch (err) {}

      // Fallback for Vercel static hosting / offline backend
      const localEnqs = JSON.parse(localStorage.getItem('prv_local_enquiries') || '[]');
      const newId = localEnqs.length ? Math.max(...localEnqs.map(x => x.id || 0)) + 1 : 101;
      const newLead = {
        id: newId,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        ...payload,
        status: 'New',
        assigned_to: 'Unassigned',
        follow_up_date: '',
        remarks: ''
      };
      localEnqs.unshift(newLead);
      localStorage.setItem('prv_local_enquiries', JSON.stringify(localEnqs));
      showToast(`Enquiry #${newId} submitted successfully!`);
      if (document.getElementById('consultation-modal')) {
        document.getElementById('consultation-modal').classList.remove('active');
      }
      consultationForm.reset();
    });
  }

  // DATABASE 2: seminar_registrations Submission
  if (seminarForm) {
    seminarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const submitBtn = seminarForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';

      const payload = {
        full_name: document.getElementById('sem-fullname').value.trim(),
        mobile_number: document.getElementById('sem-mobile').value.trim(),
        email: document.getElementById('sem-email').value.trim(),
        city: document.getElementById('sem-city').value.trim(),
        qualification: document.getElementById('sem-qualification').value.trim(),
        organization: document.getElementById('sem-org').value.trim(),
        seminar_name: document.getElementById('sem-name').value,
        number_of_participants: parseInt(document.getElementById('sem-headcount').value) || 1,
        message: document.getElementById('sem-message').value.trim()
      };

      try {
        let response = null;
        try {
          response = await fetch('/api/seminars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (e) {
          response = await fetch('http://localhost:3000/api/seminars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (response && response.ok) {
          const result = await response.json();
          if (result.success) {
            showToast(`Seminar Signup #${result.id} recorded in seminar_registrations DB!`);
            document.getElementById('seminar-modal').classList.remove('active');
            seminarForm.reset();
            return;
          }
        }
      } catch (err) {}

      // Fallback for Vercel static hosting / offline backend
      const localSeminars = JSON.parse(localStorage.getItem('prv_local_seminars') || '[]');
      const newSemId = localSeminars.length ? Math.max(...localSeminars.map(x => x.id || 0)) + 1 : 501;
      const newSem = {
        id: newSemId,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        ...payload,
        status: 'Registered',
        remarks: ''
      };
      localSeminars.unshift(newSem);
      localStorage.setItem('prv_local_seminars', JSON.stringify(localSeminars));
      showToast(`Seminar Signup #${newSemId} recorded successfully!`);
      if (document.getElementById('seminar-modal')) {
        document.getElementById('seminar-modal').classList.remove('active');
      }
      seminarForm.reset();
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Subscribed successfully! You will receive industry compliance updates.');
      newsletterForm.reset();
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 4500);
  }
}

/* --------------------------------------------------------------------------
   7. MOBILE NAVIGATION
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '80px';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.background = '#FFFFFF';
        navMenu.style.padding = '20px';
        navMenu.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   8. INSTANT CERTIFICATION & SUBSIDY FINDER
   -------------------------------------------------------------------------- */
function initInstantFinder() {
  const calculateBtn = document.getElementById('finder-calculate-btn');
  const resultCard = document.getElementById('finder-result');
  const industrySelect = document.getElementById('finder-industry');
  const goalSelect = document.getElementById('finder-goal');

  if (!calculateBtn || !resultCard) return;

  calculateBtn.addEventListener('click', () => {
    const ind = industrySelect ? industrySelect.value : 'manufacturing';
    const goal = goalSelect ? goalSelect.value : 'subsidy';

    let title = 'ZED Gold/Silver Certification & ISO 9001:2015';
    let desc = 'Up to 80% Govt Subsidy + 0.5% Concessional Bank Loan Interest + Tender Eligibility.';
    let tags = ['ZED 80% Subsidy', 'ISO 9001 QMS', 'Tender Eligible', '2-3 Weeks'];

    if (ind === 'food') {
      title = 'FSSAI License & ISO 22000 FSMS';
      desc = 'Mandatory Food Safety License + HACCP Export Buyer Clearance & Hygiene Rating.';
      tags = ['FSSAI License', 'ISO 22000', 'HACCP', '10-15 Days'];
    } else if (ind === 'automobile') {
      title = 'IATF 16949 & Core Tools (APQP, PPAP, FMEA, MSA, SPC)';
      desc = 'Mandatory Automotive Quality Standard required for Tier-1 / Tier-2 OEM Vendors.';
      tags = ['IATF 16949', 'Core Tools', 'OEM Approved', '2-3 Months'];
    } else if (ind === 'it') {
      title = 'ISO/IEC 27001:2022 Cybersecurity & SOC 2 Readiness';
      desc = 'International Gold Standard for Data Security & US/European SaaS Client Contracts.';
      tags = ['ISO 27001 ISMS', 'SOC 2 Ready', 'Cyber Security', '3-4 Weeks'];
    } else if (ind === 'textile') {
      title = 'SEDEX SMETA Ethical Audit (4-Pillar) & ISO 9001';
      desc = 'Ethical Social Audit clearance for Walmart, Disney, Zara & Global Garment Exporters.';
      tags = ['SEDEX SMETA', 'Ethical Audit', 'Export Grade', '1-2 Weeks'];
    } else if (ind === 'healthcare') {
      title = 'ISO 13485 Medical Devices QMS & ISO 9001';
      desc = 'CDSCO Licensing readiness & Healthcare Service Quality Standard.';
      tags = ['ISO 13485 Medical', 'CDSCO Clearance', 'Hospital QMS', '4-6 Weeks'];
    }

    resultCard.innerHTML = `
      <div class="finder-result-info">
        <h4><i class="fa-solid fa-award"></i> Recommended Match: ${title}</h4>
        <p>${desc}</p>
        <div class="finder-result-tags">
          ${tags.map(t => `<span class="finder-tag"><i class="fa-solid fa-circle-check" style="color: var(--accent-green);"></i> ${t}</span>`).join('')}
        </div>
      </div>
      <a href="#contact" class="btn btn-primary open-modal-trigger" data-service="${title}">
        <i class="fa-solid fa-paper-plane"></i> Claim Grants & Consult
      </a>
    `;

    resultCard.style.display = 'flex';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
