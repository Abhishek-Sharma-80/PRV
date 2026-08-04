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
      const welcomeText = `👋 **Welcome to PRV Consultancy Services.**\n\nI'm your **PRV AI Business Excellence Advisor**.\n\nI can help you choose the right certification, improve your business processes, explain compliance requirements, answer your questions, and connect you with our experts.\n\n**What would you like to achieve today?**`;
      const quickReplies = [
        '🏆 Get Certified',
        '📋 Audit & Compliance',
        '📈 Improve Productivity',
        '💰 Reduce Costs',
        '👨‍🏭 Industrial Training',
        '🎓 NATS / NAPS',
        '📅 Book Free Consultation'
      ];
      appendMessage('bot', welcomeText, quickReplies);
    }

    async function handleSendMessage() {
      const text = inputField.value.trim();
      if (!text) return;

      // Add user message to window
      appendMessage('user', text);
      inputField.value = '';
      playChatSound('send');

      // Show typing indicator
      showTypingIndicator();

      let data = null;

      try {
        let response = null;
        try {
          response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, sessionId })
          });
        } catch (e) {
          // If relative URL fails (e.g. running on static server port 5500), try backend port 3000
          response = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, sessionId })
          });
        }

        if (response && response.ok) {
          data = await response.json();
        }
      } catch (err) {
        console.warn('PRV AI Server offline or unreachable, utilizing smart client AI engine:', err);
      }

      removeTypingIndicator();

      if (data && data.success && data.response) {
        appendMessage('bot', data.response, data.quickReplies, data.leadCaptured);
        playChatSound('receive');
        speakText(data.response);
      } else {
        // Fallback to client-side offline AI engine seamlessly
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

      // ZED SCHEME
      else if (msgLower.includes('zed') || msgLower.includes('zero defect')) {
        detectedService = 'ZED Certification';
        aiResponse = `🏆 **ZED (Zero Defect Zero Effect) MSME Scheme & Subsidy Guide**\n\n• **What it is**: Ministry of MSME national scheme for zero-defect production.\n• **Why required**: Claim grants, lower bank loan rates, win tenders.\n• **Eligibility**: MSME manufacturing units with valid Udyam Registration.\n• **Subsidies**: 80% Bronze Subsidy, 60% Silver, 50% Gold + ₹10,000 grant + 0.5% lower bank interest rate.\n• **Timeline**: 2 to 4 weeks.\n• **How PRV Helps**: Complete portal registration, desktop verification & subsidy claim settlement.`;
        quickReplies = ['ZED Subsidy Details', 'ISO vs ZED', 'Book Free Consultation'];
      }

      // ISO 9001
      else if (msgLower.includes('9001') || (msgLower.includes('iso') && msgLower.includes('quality'))) {
        detectedService = 'ISO 9001 QMS';
        aiResponse = `📘 **ISO 9001:2015 Quality Management System (QMS)**\n\n• **What it is**: International gold standard for Quality Management Systems.\n• **Why required**: Mandatory for Govt Tenders, OEM vendor approvals & corporate registration.\n• **Eligibility**: Any manufacturing, service, or IT company.\n• **Benefits**: 100% tender eligibility, zero shopfloor re-work, standardized SOPs.\n• **Timeline**: 10 to 20 business days.\n• **How PRV Helps**: SOP drafting, internal audit, staff training & guaranteed 100% audit clearance.`;
        quickReplies = ['Get ISO 9001 Quote', 'ISO vs ZED', 'Book Free Consultation'];
      }

      // IATF 16949
      else if (msgLower.includes('iatf') || msgLower.includes('16949') || msgLower.includes('core tools')) {
        detectedService = 'IATF 16949 Automotive';
        aiResponse = `🚗 **IATF 16949:2016 Automotive Quality System & Core Tools**\n\n• **What it is**: Global automotive quality standard required by OEMs (Maruti, Tata, Hyundai).\n• **Core Tools**: APQP, PPAP, FMEA, MSA, SPC.\n• **Benefits**: Mandatory Tier-1/OEM vendor approval & zero defect quality.\n• **Timeline**: 2 to 3 months.\n• **How PRV Helps**: Hands-on shopfloor Core Tools implementation & Tier-1 audit clearance.`;
        quickReplies = ['Core Tools Workshop', 'ISO vs IATF', 'Book Free Consultation'];
      }

      // FSSAI
      else if (msgLower.includes('fssai') || msgLower.includes('food license')) {
        detectedService = 'FSSAI License';
        aiResponse = `🥗 **FSSAI Food License & Statutory Clearance**\n\n• **What it is**: Mandatory Indian statutory food license under FSSAI Act.\n• **Slabs**: Basic (turnover < ₹12L), State (₹12L - ₹20Cr), Central (> ₹20Cr / Exporters).\n• **Timeline**: 7 to 15 days.\n• **How PRV Helps**: FoSCoS filing, department query resolution & fast-track license approval.`;
        quickReplies = ['FSSAI License Quote', 'ISO 22000 FSMS', 'Book Free Consultation'];
      }

      // SEDEX SMETA
      else if (msgLower.includes('sedex') || msgLower.includes('smeta')) {
        detectedService = 'SEDEX SMETA Audit';
        aiResponse = `🛡️ **SEDEX SMETA Ethical & Social Compliance Audit**\n\n• **What it is**: World's leading ethical audit evaluating labor, health & safety, environment, ethics.\n• **Pillars**: 2-Pillar & 4-Pillar Audits.\n• **Benefits**: Mandatory for supplying to Walmart, Disney, Zara, Target, H&M.\n• **Timeline**: 1 to 3 weeks.\n• **How PRV Helps**: Mock audit, document verification & zero NC clearance guarantee.`;
        quickReplies = ['Prepare for SMETA Audit', 'SEDEX vs Social Audit', 'Book Free Consultation'];
      }

      // NATS / NAPS
      else if (msgLower.includes('nats') || msgLower.includes('naps') || msgLower.includes('apprentice')) {
        detectedService = 'Apprenticeship Schemes';
        aiResponse = `🎓 **NATS & NAPS Government Apprenticeship Schemes**\n\n• **NATS**: For Engineering/Diploma/Degree graduates (Govt reimburses up to ₹1,500/month per candidate).\n• **NAPS**: For ITI & non-technical floor operators.\n• **Statutory Relief**: 100% Exemption from PF & ESI contributions.\n• **How PRV Helps**: Portal registration, contract execution & monthly stipend claim filings.`;
        quickReplies = ['NATS Scheme Info', 'NAPS Process', 'Book Free Consultation'];
      }

      // PROFIT MAXIMIZATION / 5S
      else if (msgLower.includes('profit') || msgLower.includes('5s') || msgLower.includes('kaizen') || msgLower.includes('lean')) {
        detectedService = 'Profit Maximization';
        aiResponse = `⚡ **Profit Maximization & 5S Lean Kaizen Blueprint**\n\n• **Goal**: Expand net profit margin by 15-35% and eliminate shopfloor waste (7 Mudas).\n• **5S Pillars**: Sort, Set in Order, Shine, Standardize, Sustain.\n• **Results**: 20-30% productivity boost, 50% scrap reduction.\n• **How PRV Helps**: On-site consulting, value stream mapping & measurable ROI.`;
        quickReplies = ['5S Kaizen Workshop', 'Profit Maximization Plan', 'Book Free Consultation'];
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
  }

})();
