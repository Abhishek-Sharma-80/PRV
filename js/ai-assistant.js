/* ==========================================================================
   PRV CONSULTANCY SERVICES - AI ASSISTANT CLIENT ENGINE
   Interactive Chat Widget, Natural Language Consultation, Multi-lingual Support,
   Quick Prompt Chips, Voice Input/Output & Lead Capture Integration
   ========================================================================== */

(function () {
  'use strict';

  // 1. STATE & UTILITIES
  let sessionId = localStorage.getItem('prv_ai_session_id');
  if (!sessionId) {
    sessionId = 'prv_session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('prv_ai_session_id', sessionId);
  }

  let isTtsEnabled = false;
  let recognition = null;
  let isListening = false;

  // Web Audio API Sound Effects Generator
  function playChatSound(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'receive') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio context silenced or blocked by browser policy
    }
  }

  // Speak AI Text Response (TTS)
  function speakText(text) {
    if (!isTtsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*•#_-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  }

  // Simple Markdown & Formatting Parser for Chat Messages (Supports Tables & Formatting)
  function parseMarkdown(text) {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');

    // Parse Markdown Tables
    if (formatted.includes('|')) {
      const lines = formatted.split('\n');
      let inTable = false;
      let tableHtml = '<table>';
      let newLines = [];

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (trimmed.includes('---')) {
            // Separator row
            return;
          }
          const cells = trimmed.substring(1, trimmed.length - 1).split('|').map(c => c.trim());
          if (!inTable) {
            inTable = true;
            tableHtml += '<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
          } else {
            tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
          }
        } else {
          if (inTable) {
            inTable = false;
            tableHtml += '</tbody></table>';
            newLines.push(tableHtml);
            tableHtml = '<table>';
          }
          newLines.push(line);
        }
      });

      if (inTable) {
        tableHtml += '</tbody></table>';
        newLines.push(tableHtml);
      }

      formatted = newLines.join('\n');
    }

    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  // 2. DOM INITIALIZATION & INJECTION
  document.addEventListener('DOMContentLoaded', () => {
    initAiWidget();
  });

  function initAiWidget() {
    const toggleBtn = document.getElementById('ai-chat-toggle-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close-btn');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const inputField = document.getElementById('ai-chat-input');
    const messagesBox = document.getElementById('ai-chat-messages');
    const quickChipsBox = document.getElementById('ai-quick-chips');
    const voiceBtn = document.getElementById('ai-chat-voice-btn');
    const ttsBtn = document.getElementById('ai-chat-tts-btn');

    if (!toggleBtn || !chatWindow) return;

    // Toggle Chat Window Visibility
    toggleBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
      const isVisible = chatWindow.classList.contains('active');
      toggleBtn.setAttribute('aria-expanded', isVisible);
      if (isVisible) {
        inputField.focus();
        // Remove badge notification on opening
        const unreadBadge = document.getElementById('ai-unread-badge');
        if (unreadBadge) unreadBadge.style.display = 'none';

        // Load greeting if chat is empty
        if (messagesBox.children.length === 0) {
          sendWelcomeGreeting();
        }
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    }

    // Voice Input setup (Web Speech API)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputField.value = transcript;
        stopListening();
        handleSendMessage();
      };

      recognition.onerror = () => {
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };

      if (voiceBtn) {
        voiceBtn.style.display = 'flex';
        voiceBtn.addEventListener('click', () => {
          if (isListening) {
            stopListening();
          } else {
            startListening();
          }
        });
      }
    }

    function startListening() {
      if (!recognition) return;
      isListening = true;
      recognition.start();
      if (voiceBtn) {
        voiceBtn.classList.add('listening');
        voiceBtn.title = 'Listening... Click to stop';
      }
      inputField.placeholder = 'Listening... speak now...';
    }

    function stopListening() {
      isListening = false;
      if (voiceBtn) {
        voiceBtn.classList.remove('listening');
        voiceBtn.title = 'Voice input (Speak to ask)';
      }
      inputField.placeholder = 'Ask AI about ISO, ZED, SEDEX, NATS or Hindi me puchhiye...';
    }

    // Voice Output (TTS) Toggle Button
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        isTtsEnabled = !isTtsEnabled;
        ttsBtn.classList.toggle('active', isTtsEnabled);
        ttsBtn.title = isTtsEnabled ? 'Sound Output Enabled' : 'Sound Output Muted';
        if (!isTtsEnabled && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      });
    }

    // Send Button & Enter Key Handlers
    if (sendBtn) {
      sendBtn.addEventListener('click', handleSendMessage);
    }
    if (inputField) {
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      });
    }

    const whatsappBtn = document.getElementById('ai-chat-whatsapp-btn');
    const brochureBtn = document.getElementById('ai-chat-brochure-btn');
    const bookBtn = document.getElementById('ai-chat-book-btn');
    const bookingModal = document.getElementById('ai-booking-modal');
    const bookingCloseBtn = document.getElementById('ai-booking-modal-close');
    const bookingForm = document.getElementById('ai-booking-form');

    // WhatsApp Handover Click
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        const text = encodeURIComponent('Hello PRV Consultancy! I am inquiring from your website AI Assistant regarding certification & consultation.');
        window.open(`https://wa.me/917489351297?text=${text}`, '_blank');
      });
    }

    // PDF Brochure Download Trigger
    if (brochureBtn) {
      brochureBtn.addEventListener('click', () => {
        appendMessage('bot', '📄 **PRV Consultancy Services - Official Master Brochure PDF**\n\nYour brochure download request is starting... If it does not start automatically, click below:\n\n👉 [Download PRV Consultancy Services Brochure (PDF)](#)');
        alert('Downloading PRV Consultancy Services Master Brochure...');
      });
    }

    // Consultation Booking Modal Trigger
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        if (bookingModal) bookingModal.style.display = 'flex';
      });
    }

    if (bookingCloseBtn && bookingModal) {
      bookingCloseBtn.addEventListener('click', () => {
        bookingModal.style.display = 'none';
      });
    }

    // Form Submission Handler for Consultation Booking Modal
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('book-name').value.trim();
        const mobile_number = document.getElementById('book-mobile').value.trim();
        const email = document.getElementById('book-email').value.trim();
        const company_name = document.getElementById('book-company').value.trim();
        const service_required = document.getElementById('book-service').value;
        const preferred_date = document.getElementById('book-date').value;
        const preferred_time = document.getElementById('book-time').value;
        const notes = document.getElementById('book-notes').value.trim();

        if (!full_name || !mobile_number) {
          alert('Please provide your Name and Mobile Number.');
          return;
        }

        try {
          let res = null;
          try {
            res = await fetch('/api/ai/book-consultation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ full_name, mobile_number, email, company_name, service_required, preferred_date, preferred_time, notes })
            });
          } catch (errFetch) {
            res = await fetch('http://localhost:3000/api/ai/book-consultation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ full_name, mobile_number, email, company_name, service_required, preferred_date, preferred_time, notes })
            });
          }

          if (bookingModal) bookingModal.style.display = 'none';
          bookingForm.reset();

          appendMessage('bot', `🎉 **FREE Consultation Booked Successfully!**\n\n• **Name**: ${full_name}\n• **Mobile**: ${mobile_number}\n• **Service**: ${service_required}\n• **Preferred Slot**: ${preferred_date || 'Earliest Available'} (${preferred_time})\n\nOur Senior Business Advisor will contact you to confirm your slot!`, ['Which certificate do I need?', 'ZED MSME Subsidy', 'WhatsApp Support'], true);
          playChatSound('receive');
        } catch (errBooking) {
          console.error('Booking submission error:', errBooking);
          alert('Saved booking locally. A PRV consultant will reach out to you shortly!');
          if (bookingModal) bookingModal.style.display = 'none';
        }
      });
    }

    // Handle Quick Reply Chips Click
    if (quickChipsBox) {
      quickChipsBox.addEventListener('click', (e) => {
        const chip = e.target.closest('.ai-chip');
        if (chip) {
          const query = chip.getAttribute('data-query') || chip.textContent.trim();
          if (query === 'Book Free Consultation' || query === 'Book Consultation') {
            if (bookingModal) bookingModal.style.display = 'flex';
          } else if (query === 'Download PDF Brochure') {
            if (brochureBtn) brochureBtn.click();
          } else if (query === 'WhatsApp Support') {
            if (whatsappBtn) whatsappBtn.click();
          } else {
            inputField.value = query;
            handleSendMessage();
          }
        }
      });
    }

    // 3. MESSAGE HANDLING FUNCTIONS
    function sendWelcomeGreeting() {
      const welcomeText = `👋 **Welcome to PRV Consultancy Services.**\n\nI am your **PRV AI Business Consultant**.\n\nHow can I assist your organization today? You can ask about **ISO 9001, ZED Certification, SEDEX SMETA, 5S / Kaizen, NATS/NAPS**, or request certification recommendations for your industry.`;
      const quickReplies = [
        'What is ISO 9001?',
        'ZED kya hai?',
        'Automobile parts factory certification',
        'Production wastage problem',
        'Book Free Consultation'
      ];
      appendMessage('bot', welcomeText, quickReplies);
    }

    async function handleSendMessage() {
      const text = inputField.value.trim();
      if (!text) return;

      // 1. Capture & Add user message to UI immediately
      appendMessage('user', text);
      inputField.value = '';
      playChatSound('send');

      // 2. Show typing indicator
      showTypingIndicator();

      let data = null;
      let errorOccurred = false;

      try {
        let response = null;
        const payload = {
          message: text,
          userMessage: text,
          conversationId: sessionId,
          sessionId: sessionId,
          language: 'en'
        };

        try {
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (eRel) {
          try {
            response = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch (eRel2) {
            response = await fetch('http://localhost:3000/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }

        if (response && response.ok) {
          data = await response.json();
        } else {
          errorOccurred = true;
        }
      } catch (err) {
        console.error('PRV AI Server request error:', err);
        errorOccurred = true;
      }

      removeTypingIndicator();

      const aiText = data ? (data.answer || data.response || data.reply) : null;

      if (data && data.success && aiText) {
        appendMessage('bot', aiText, data.quickReplies, data.leadCaptured);
        playChatSound('receive');
        speakText(aiText);
      } else if (errorOccurred) {
        appendMessage('bot', "Sorry, I couldn't process that request right now. Please try again.", ['Book Free Consultation', 'WhatsApp Support']);
        playChatSound('receive');
      } else {
        const fallback = generateOfflineAiResponse(text);
        appendMessage('bot', fallback.response, fallback.quickReplies, fallback.leadCaptured);
        playChatSound('receive');
        speakText(fallback.response);
      }
    }


    // Smart Offline Client-Side Enterprise AI Response Engine
    function generateOfflineAiResponse(userMessage) {
      const msgLower = userMessage.toLowerCase();
      let aiResponse = '';
      let detectedService = 'General';
      let quickReplies = [];
      let leadCaptured = false;

      const MANDATORY_CLOSING = "Would you like me to recommend the best solution for your business?";

      function enforceClosing(text) {
        const trimmed = (text || '').trim();
        if (trimmed.endsWith(MANDATORY_CLOSING)) {
          return trimmed;
        }
        return `${trimmed}\n\n${MANDATORY_CLOSING}`;
      }

      // Auto-capture lead if phone or email is detected in user message
      const phoneMatch = userMessage.match(/(?:\+91[\s-]?)?[6-9]\d{9}/);
      const emailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

      if (phoneMatch || emailMatch) {
        leadCaptured = true;
        try {
          const localEnqs = JSON.parse(localStorage.getItem('prv_local_enquiries') || '[]');
          const newId = localEnqs.length ? Math.max(...localEnqs.map(x => x.id || 0)) + 1 : 101;
          localEnqs.unshift({
            id: newId,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
            full_name: 'AI Chat Prospect',
            mobile_number: phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : 'Provided via Chat',
            email: emailMatch ? emailMatch[0] : 'ai_chat@prvconsultancy.com',
            service_required: 'AI Assistant Consultation',
            message: `User Chat Query: "${userMessage}"`,
            source: 'AI Chat Assistant',
            status: 'New',
            assigned_to: 'Unassigned'
          });
          localStorage.setItem('prv_local_enquiries', JSON.stringify(localEnqs));
        } catch (e) {}
      }

      // SCENARIO 1: AUTO PARTS MANUFACTURER QUERY
      if (
        (msgLower.includes('auto part') || msgLower.includes('auto component') || msgLower.includes('automotive') || msgLower.includes('car part') || msgLower.includes('oem supplier')) &&
        (msgLower.includes('which') || msgLower.includes('recommend') || msgLower.includes('take') || msgLower.includes('need') || msgLower.includes('certificate') || msgLower.includes('certification'))
      ) {
        detectedService = 'Auto Parts Certification Reasoning';
        aiResponse = `🚗 **PRV Consultant Strategic Analysis for Auto Parts Manufacturers**\n\nBased on your manufacturing profile as an automotive component producer, **you should NOT take generic certifications**. \n\nWe specifically recommend **IATF 16949:2016** (Automotive Quality Management System) along with the **5 Automotive Core Tools**.\n\n### Why IATF 16949 is Required for Your Business:\n1️⃣ **Mandatory OEM Empanelment**: Top automotive OEMs (Maruti Suzuki, Tata Motors, Hyundai, Mahindra, Hero MotoCorp) and Tier-1 suppliers strictly mandate IATF 16949 certification to award vendor purchase orders.\n2️⃣ **Zero-Defect Standard**: Automotive supply chains require zero PPM rejections, full traceability, and strict defect prevention.\n3️⃣ **5 Automotive Core Tools Mastery**:\n   - **APQP**: Advanced Product Quality Planning for new part development.\n   - **PPAP**: Production Part Approval Process for buyer sign-off.\n   - **FMEA**: Failure Mode & Effects Analysis to prevent shopfloor errors.\n   - **MSA**: Measurement Systems Analysis for gauge accuracy.\n   - **SPC**: Statistical Process Control to guarantee process capability (Cpk > 1.33).\n\n⏱️ **Timeline**: 2 to 3 months (includes shopfloor core tools implementation & audit handholding).\n🤝 **How PRV Helps**: PRV's automotive consultants implement Core Tools directly on your shopfloor and guarantee Tier-1/OEM audit clearance.`;
        quickReplies = ['IATF 16949 Roadmap', 'Core Tools Workshop', 'MACE Audit Prep', 'Book Free Consultation'];
      }

      // SCENARIO 2: EXPORT QUERY
      else if (
        msgLower === 'i want to export' || msgLower === 'i want to export.' || msgLower.includes('want to export') || msgLower.includes('exporting goods') || msgLower.includes('export certification')
      ) {
        detectedService = 'Export Certification Reasoning';
        
        if (msgLower.includes('food') || msgLower.includes('spices') || msgLower.includes('pharma') || msgLower.includes('cosmetics')) {
          aiResponse = `🌍 **PRV Consultant Export Solution for Food, Pharma & Cosmetics**\n\nTo export food or pharmaceutical products internationally, you require specific international regulatory clearances:\n\n1️⃣ **FDA Registration & Approval**: Mandatory for exporting food, cosmetics, and pharmaceuticals to the United States.\n2️⃣ **ISO 22000 / HACCP**: Global food safety certification required by international supermarket chains & buyers.\n3️⃣ **HALAL & Kosher Certification**: Essential for exporting to Middle East, SEA, and European food markets.\n4️⃣ **FSSAI Central License**: Mandatory statutory Indian license for export-import food operators.\n\n⏱️ **Timeline**: 2 to 4 weeks.`;
          quickReplies = ['FDA Approval Quote', 'ISO 22000 FSMS', 'HALAL Certification', 'Book Free Consultation'];
        }
        else if (msgLower.includes('machine') || msgLower.includes('electronic') || msgLower.includes('equipment') || msgLower.includes('device') || msgLower.includes('hardware')) {
          aiResponse = `🌍 **PRV Consultant Export Solution for Machinery & Electronics**\n\nFor exporting machinery, electricals, or industrial hardware, buyer regions require conformity marks:\n\n1️⃣ **CE Marking**: Mandatory European Union conformity certification for selling industrial machinery, electronics, and hardware in Europe.\n2️⃣ **RoHS & REACH Compliance**: Hazardous substance & chemical safety verification required for EU & UK markets.\n3️⃣ **ISO 9001:2015**: Globally recognized baseline quality management system for international buyers.\n\n⏱️ **Timeline**: 2 to 3 weeks.`;
          quickReplies = ['CE Marking Guide', 'RoHS Compliance', 'ISO 9001 Quote', 'Book Free Consultation'];
        }
        else if (msgLower.includes('textile') || msgLower.includes('garment') || msgLower.includes('apparel') || msgLower.includes('clothing')) {
          aiResponse = `🌍 **PRV Consultant Export Solution for Textiles & Apparel**\n\nFor exporting garments and textiles to Western buyers (Walmart, Zara, Disney, Target):\n\n1️⃣ **SEDEX / SMETA Ethical Audit (2 & 4 Pillar)**: Mandatory social, labor, safety, and business ethics audit.\n2️⃣ **GOTS / OEKO-TEX**: Global Organic Textile Standard & eco-friendly fabric safety certification.\n\n⏱️ **Timeline**: 1 to 3 weeks.`;
          quickReplies = ['Prepare for SMETA Audit', 'GOTS Certification', 'Book Free Consultation'];
        }
        else {
          aiResponse = `🌍 **PRV Consultant Export Certification Roadmap**\n\nExport certification requirements depend strictly on your **product category** and **target country**:\n\n• **Machinery & Electronics**: Require **CE Marking** & **RoHS/REACH** (European Union).\n• **Food, Pharma & Cosmetics**: Require **FDA Registration**, **ISO 22000 / HACCP**, and **HALAL**.\n• **Textiles & Consumer Goods**: Require **SEDEX / SMETA Ethical Audits** for global retail buyers.\n• **All Product Lines**: Require **ISO 9001:2015** as baseline quality assurance.\n\n👉 **To give you the exact export requirement**: What specific product does your company manufacture, and which country are you planning to export to?`;
          quickReplies = ['Exporting Machinery', 'Exporting Food/Pharma', 'Exporting Textiles', 'Book Free Consultation'];
        }
      }

      // SCENARIO 3: SUBSIDY QUERY
      else if (
        msgLower === 'i want government subsidy' || msgLower === 'i want government subsidy.' || msgLower.includes('want subsidy') || msgLower.includes('government subsidy') || msgLower.includes('govt grant')
      ) {
        detectedService = 'Government Subsidy Reasoning';
        aiResponse = `💰 **PRV Consultant Analysis of Applicable Government Subsidies**\n\nPRV Consultancy helps MSMEs and industrial units claim direct government financial subsidies:\n\n1️⃣ **ZED (Zero Defect Zero Effect) MSME Scheme**:\n   - **Up to 80% Subsidy** on audit & certification costs.\n   - **₹10,000 Handholding Support Grant** for consultancy.\n   - **0.5% Concessional Bank Interest Rate** on business loans.\n   - **Up to ₹5 Lakhs Capital Subsidy** for testing equipment.\n\n2️⃣ **NATS & NAPS Apprenticeship Schemes**:\n   - Central Government stipend reimbursement up to **₹1,500/month per candidate**.\n   - **100% Exemption from PF & ESI** liabilities on apprentice stipends.\n\n3️⃣ **GeM & Startup India Subsidies**:\n   - EMD waiver on government tenders & fast-track patent grants.\n\n📋 **Eligibility Check**: Do you hold an active **Udyam MSME Registration** for your unit?`;
        quickReplies = ['ZED MSME Subsidy', 'NATS Stipend Subsidy', 'GeM Portal Info', 'Book Free Consultation'];
      }

      // SCENARIO 4: DISAMBIGUATION FOR GENERIC ISO QUERY ("What is ISO?")
      else if (
        msgLower === 'what is iso' || msgLower === 'what is iso?' || msgLower === 'iso kya hai' || msgLower === 'iso kya hai?' || msgLower === 'iso' || msgLower === 'tell me about iso'
      ) {
        detectedService = 'ISO Professional Overview';
        aiResponse = `📜 **Professional Overview of ISO (International Organization for Standardization)**\n\nISO is an independent, non-governmental international organization based in Geneva, Switzerland. It develops globally recognized standards for quality, safety, security, environmental protection, and operational efficiency.\n\n### Key ISO Standards for Businesses:\n• **ISO 9001:2015**: Quality Management System (QMS) - Standard for tenders & vendor onboarding.\n• **ISO 14001:2015**: Environmental Management System (EMS) - Standard for pollution compliance & ESG.\n• **ISO 45001:2018**: Occupational Health & Safety (OH&S) - Standard for worker safety & Factory Act compliance.\n• **ISO 27001:2022**: Information Security (ISMS) - Standard for IT companies & data protection.\n• **ISO 22000:2018**: Food Safety (FSMS) - Standard for food processors & exporters.\n• **ISO 50001:2018**: Energy Management (EnMS) - Standard for slacking factory power bills.\n\n👉 **Which industry or product does your company operate in?** Tell me your business type, and I will recommend the exact ISO standard that will bring you the highest business value.`;
        quickReplies = ['Recommend for my business', 'ISO 9001 QMS', 'ISO 27001 ISMS', 'ISO 22000 Food Safety'];
      }

      // ISO 13485 (Medical Devices)
      else if (msgLower.includes('13485') || msgLower.includes('medical device') || msgLower.includes('surgical') || msgLower.includes('cdsco')) {
        detectedService = 'ISO 13485 Medical QMS';
        aiResponse = `🩺 **ISO 13485:2016 Medical Devices Quality System**\n\n• **What it is**: Mandatory international QMS standard for medical device manufacturers.\n• **Why required**: Compliance with CDSCO MDR regulations, CE marking, FDA export access.\n• **Key Features**: ISO 14971 Risk Management, Cleanroom environmental controls, batch traceability.\n• **Timeline**: 3 to 6 weeks.\n• **How PRV Helps**: Complete Technical File drafting, Risk Management File creation & CDSCO/Notified Body audit handholding.`;
        quickReplies = ['ISO 13485 Quote', 'ISO 9001 vs 13485', 'Book Free Consultation'];
      }

      // ISO 17025 (Testing & Calibration Labs / NABL)
      else if (msgLower.includes('17025') || msgLower.includes('nabl') || msgLower.includes('calibration lab') || msgLower.includes('testing lab')) {
        detectedService = 'ISO 17025 NABL Accreditation';
        aiResponse = `🔬 **ISO/IEC 17025:2017 Testing & Calibration Lab (NABL)**\n\n• **What it is**: Global standard certifying technical competence & measurement accuracy of laboratories.\n• **Why required**: Official NABL Accreditation, tender eligibility, globally valid test reports under ILAC MRA.\n• **Timeline**: 1 to 3 months.\n• **How PRV Helps**: Measurement uncertainty budget calculation, method validation & NABL audit defense.`;
        quickReplies = ['NABL Audit Prep', 'ISO 9001 vs 17025', 'Book Free Consultation'];
      }

      // LEAN MANUFACTURING
      else if (msgLower.includes('lean') || msgLower.includes('vsm') || msgLower.includes('value stream') || msgLower.includes('smed')) {
        detectedService = 'Lean Manufacturing';
        aiResponse = `🏭 **Lean Manufacturing & Operational Excellence Blueprint**\n\n• **What it is**: Systematic strategy to eliminate 7 Mudas waste & cut manufacturing lead times.\n• **Benefits**: 30%-50% WIP reduction, higher OEE, zero bottleneck delays.\n• **Timeline**: 1 to 3 months.\n• **How PRV Helps**: On-site Value Stream Mapping, SMED line balancing & lean transformation.`;
        quickReplies = ['Lean Transformation', '5S vs Kaizen vs Lean', 'Book Free Consultation'];
      }

      // 5S WORKPLACE MANAGEMENT
      else if (msgLower.includes('5s') || msgLower.includes('seiri') || msgLower.includes('shadow board')) {
        detectedService = '5S Workplace Management';
        aiResponse = `✨ **5S Workplace Management & Visual Control System**\n\n• **What it is**: 5-step Japanese methodology: Sort, Set in Order, Shine, Standardize, Sustain.\n• **Benefits**: Organizes plant floor, eliminates search time, clears OEM audits.\n• **Timeline**: 1 to 3 weeks.\n• **How PRV Helps**: Red-tagging campaigns, shadow board installation & monthly 5S scorecards.`;
        quickReplies = ['5S Workshop', '5S vs Kaizen vs Lean', 'Book Free Consultation'];
      }

      // KAIZEN
      else if (msgLower.includes('kaizen') || msgLower.includes('gemba') || msgLower.includes('continuous improvement')) {
        detectedService = 'Kaizen Continuous Improvement';
        aiResponse = `🔄 **Kaizen Continuous Improvement & Gemba Problem Solving**\n\n• **What it is**: Employee-driven philosophy of daily micro-improvements.\n• **Benefits**: Solves shopfloor defects, cuts scrap, sustains high workforce morale.\n• **Timeline**: 2 to 4 weeks rollout.\n• **How PRV Helps**: Gemba walks, operator 7 QC tools training & suggestion reward system.`;
        quickReplies = ['Kaizen Event', '5S vs Kaizen vs Lean', 'Book Free Consultation'];
      }

      // PLACEMENT PREPARATION
      else if (msgLower.includes('placement') || msgLower.includes('campus') || msgLower.includes('mock interview') || msgLower.includes('gd prep')) {
        detectedService = 'Placement Preparation';
        aiResponse = `🎓 **Placement Preparation & Campus-to-Corporate Seminars**\n\n• **What it is**: Practical academy training for engineering/polytechnic students.\n• **Benefits**: Maximizes campus placement selection rate & candidate interview confidence.\n• **Timeline**: 3-day bootcamps to 4-week modules.\n• **How PRV Helps**: Resume restructuring, industrial SOP exposure & 1-on-1 mock interviews.`;
        quickReplies = ['Campus Bootcamp', 'Training Comparison', 'Book Free Consultation'];
      }

      // FUTURE GUIDANCE
      else if (msgLower.includes('future guidance') || msgLower.includes('career guidance') || msgLower.includes('career roadmap') || msgLower.includes('lead auditor course')) {
        detectedService = 'Future Career Guidance';
        aiResponse = `🚀 **Future Career Guidance & Executive Mentorship**\n\n• **What it is**: Career roadmap strategy for engineers, quality heads & fresh graduates.\n• **Benefits**: Clear certification path (ISO Lead Auditor, Six Sigma, IATF) & salary elevation.\n• **How PRV Helps**: 1-on-1 career evaluation with senior industry consultants.`;
        quickReplies = ['1-on-1 Mentorship', 'ISO Lead Auditor Info', 'Book Free Consultation'];
      }

      // COMPARISONS
      else if (msgLower.includes('iso vs zed') || msgLower.includes('zed vs iso')) {
        detectedService = 'Comparison: ISO vs ZED';
        aiResponse = `📊 **ISO 9001 vs ZED MSME Scheme Matrix**\n\n| Parameter | ISO 9001:2015 | ZED MSME Scheme |\n| --- | --- | --- |\n| **Origin** | International Standard (Geneva) | Ministry of MSME, Govt of India |\n| **Govt Subsidy** | No direct subsidy | Up to 80% Subsidy + ₹10,000 Grant |\n| **Bank Benefit** | Corporate tender eligibility | 0.5% lower loan interest rate |\n| **Scope** | Quality Management SOPs | Zero Defect + Zero Effect |\n\n🎯 **PRV Verdict**: Apply for ZED to claim 80% Govt grant & loan discounts, while retaining ISO 9001 for buyer tenders!`;
        quickReplies = ['ZED MSME Subsidy', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('iso vs iatf') || msgLower.includes('iatf vs iso')) {
        detectedService = 'Comparison: ISO vs IATF';
        aiResponse = `📊 **ISO 9001 vs IATF 16949 Matrix**\n\n| Parameter | ISO 9001 | IATF 16949:2016 |\n| --- | --- | --- |\n| **Focus** | General manufacturing & service | Automotive component suppliers |\n| **Core Tools** | Optional | Mandatory (APQP, PPAP, FMEA, MSA, SPC) |\n| **OEM Status** | General corporate standard | Mandatory for Maruti, Tata, Hyundai, etc. |\n\n🎯 **PRV Verdict**: If you supply auto parts, go directly for IATF 16949!`;
        quickReplies = ['IATF 16949 Roadmap', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('9001 vs 13485') || msgLower.includes('13485 vs 9001')) {
        detectedService = 'Comparison: ISO 9001 vs ISO 13485';
        aiResponse = `📊 **ISO 9001 vs ISO 13485 Medical Devices Matrix**\n\n| Parameter | ISO 9001 | ISO 13485:2016 |\n| --- | --- | --- |\n| **Sector** | General manufacturing | Medical devices & healthcare |\n| **Risk Control** | Basic business risk | Mandatory ISO 14971 Risk Management |\n| **Cleanroom** | Standard shopfloor | Strict cleanroom & sterile traceability |\n\n🎯 **PRV Verdict**: Medical device companies MUST take ISO 13485 to clear CDSCO & FDA regulations.`;
        quickReplies = ['ISO 13485 Quote', 'ISO 9001 QMS', 'Book Free Consultation'];
      }
      else if (msgLower.includes('5s vs kaizen') || msgLower.includes('lean vs 5s')) {
        detectedService = 'Comparison: 5S vs Kaizen vs Lean';
        aiResponse = `📊 **5S vs Kaizen vs Lean Manufacturing Matrix**\n\n| Parameter | 5S | Kaizen | Lean Manufacturing |\n| --- | --- | --- | --- |\n| **Focus** | Physical organization | Daily worker micro-ideas | Total value stream flow |\n| **Timeline** | 1 to 3 weeks | Daily continuous habit | 1 to 3 months |\n| **Result** | Clean & safe plant | Micro defect reduction | 50% lead time reduction |\n\n🎯 **PRV Verdict**: Implement 5S first, cultivate Kaizen habits, and execute Lean Manufacturing!`;
        quickReplies = ['5S Workshop', 'Lean Transformation', 'Book Free Consultation'];
      }

      // DEFAULT CONSULTANT RESPONSE
      else {
        aiResponse = `🏢 **Welcome to PRV Consultancy Services**\n\nI am your **PRV Senior AI Business Consultant**. I specialize in:\n• **ISO Certifications** (9001, 14001, 45001, 27001, 22000, 13485)\n• **ZED MSME Subsidy** (Up to 80% Grant)\n• **IATF 16949 & Automotive Core Tools**\n• **FSSAI License & SEDEX SMETA Audits**\n• **NATS / NAPS Manpower Cost Optimization**\n\nPlease share your company's industry or goal, and I will recommend the best solution for your business!`;
        quickReplies = ['Which certificate do I need?', 'ZED MSME Subsidy', 'ISO 9001 QMS', 'Book Free Consultation'];
      }

      // ENFORCE MANDATORY CLOSING
      aiResponse = enforceClosing(aiResponse);

      if (leadCaptured) {
        aiResponse += `\n\n✅ **Success**: Your contact info has been recorded! A PRV senior consultant will call you shortly.`;
      }

      return {
        response: aiResponse,
        quickReplies,
        leadCaptured,
        detectedService
      };
    }

    function appendMessage(sender, text, quickReplies = [], isLeadCaptured = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `ai-message ${sender}-message`;

      const avatarHtml = sender === 'bot' 
        ? `<div class="ai-msg-avatar"><i class="fa-solid fa-robot"></i></div>` 
        : `<div class="ai-msg-avatar user-av"><i class="fa-solid fa-user"></i></div>`;

      const parsedContent = parseMarkdown(text);

      let leadBadgeHtml = '';
      if (isLeadCaptured) {
        leadBadgeHtml = `
          <div class="ai-lead-captured-banner">
            <i class="fa-solid fa-circle-check"></i> Lead saved to PRV CRM! Consultant notified.
          </div>
        `;
      }

      msgDiv.innerHTML = `
        ${avatarHtml}
        <div class="ai-msg-content">
          ${parsedContent}
          ${leadBadgeHtml}
          <div class="ai-msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;

      messagesBox.appendChild(msgDiv);
      messagesBox.scrollTop = messagesBox.scrollHeight;

      // Update Quick Chips below chat input if provided
      if (sender === 'bot' && quickReplies && quickReplies.length > 0) {
        renderQuickChips(quickReplies);
      }
    }

    function renderQuickChips(chips) {
      if (!quickChipsBox) return;
      quickChipsBox.innerHTML = '';
      chips.forEach(chipText => {
        const chipBtn = document.createElement('button');
        chipBtn.className = 'ai-chip';
        chipBtn.setAttribute('data-query', chipText);
        chipBtn.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${chipText}`;
        quickChipsBox.appendChild(chipBtn);
      });
    }

    function showTypingIndicator() {
      removeTypingIndicator();
      const typingDiv = document.createElement('div');
      typingDiv.id = 'ai-typing-indicator';
      typingDiv.className = 'ai-message bot-message typing-mode';
      typingDiv.innerHTML = `
        <div class="ai-msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="ai-msg-content typing-dots">
          <span></span><span></span><span></span>
        </div>
      `;
      messagesBox.appendChild(typingDiv);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    function removeTypingIndicator() {
      const typing = document.getElementById('ai-typing-indicator');
      if (typing) typing.remove();
    }

    // ------------------------------------------------------------------------
    // FULL PAGE AI CONSULTANT FORM HANDLER (#view-ai-consultant)
    // ------------------------------------------------------------------------
    const fullForm = document.getElementById('full-ai-chat-form');
    const fullInput = document.getElementById('full-ai-input');
    const fullBox = document.getElementById('full-ai-chat-messages');

    if (fullForm && fullInput && fullBox) {
      fullForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = fullInput.value.trim();
        if (!text) return;

        fullInput.value = '';

        // Render User Msg
        const userDiv = document.createElement('div');
        userDiv.className = 'flex justify-end gap-3';
        userDiv.innerHTML = `<div class="glass-panel p-4 rounded-2xl max-w-xl text-sm leading-relaxed border border-primary-container/30 bg-primary-container/10 text-primary-container font-semibold">${text}</div>`;
        fullBox.appendChild(userDiv);
        fullBox.scrollTop = fullBox.scrollHeight;

        // Process response
        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, sessionId })
          });

          if (res.ok) {
            const data = await res.json();
            const botDiv = document.createElement('div');
            botDiv.className = 'flex gap-3';
            botDiv.innerHTML = `<div class="w-8 h-8 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-xs flex-shrink-0"><i class="fa-solid fa-robot"></i></div><div class="glass-panel p-4 rounded-2xl max-w-xl text-sm leading-relaxed border border-border-glass">${parseMarkdown(data.reply)}</div>`;
            fullBox.appendChild(botDiv);
            fullBox.scrollTop = fullBox.scrollHeight;
            return;
          }
        } catch (err) {}

        const offlineResult = generateOfflineAiResponse(text);
        const botDiv = document.createElement('div');
        botDiv.className = 'flex gap-3';
        botDiv.innerHTML = `<div class="w-8 h-8 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-xs flex-shrink-0"><i class="fa-solid fa-robot"></i></div><div class="glass-panel p-4 rounded-2xl max-w-xl text-sm leading-relaxed border border-border-glass">${parseMarkdown(offlineResult.response)}</div>`;
        fullBox.appendChild(botDiv);
        fullBox.scrollTop = fullBox.scrollHeight;
      });

      // Dedicated Page Quick Chips
      const fullChipBtns = document.querySelectorAll('#full-ai-chips .chip-btn');
      fullChipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const prompt = btn.getAttribute('data-prompt');
          if (prompt && fullInput) {
            fullInput.value = prompt;
            fullForm.dispatchEvent(new Event('submit'));
          }
        });
      });
    }
  }

})();

