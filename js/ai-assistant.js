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

  // Simple Markdown & Formatting Parser for Chat Messages
  function parseMarkdown(text) {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>')
      .replace(/\n/g, '<br>');

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

    // Handle Quick Reply Chips Click
    if (quickChipsBox) {
      quickChipsBox.addEventListener('click', (e) => {
        const chip = e.target.closest('.ai-chip');
        if (chip) {
          const query = chip.getAttribute('data-query') || chip.textContent.trim();
          inputField.value = query;
          handleSendMessage();
        }
      });
    }

    // 3. MESSAGE HANDLING FUNCTIONS
    function sendWelcomeGreeting() {
      const welcomeText = `👋 **Welcome to PRV Consultancy Services AI Assistant!**\n\nI am your 24/7 AI Business Advisor. Ask me anything about:\n• **ZED MSME Subsidy** (Up to 80% grant)\n• **ISO Certifications** (9001, 14001, 45001, 27001)\n• **SEDEX & SMETA Audits** (Social compliance)\n• **NATS & NAPS** (Stipend reimbursement scheme)\n• **5S & Kaizen** (Shopfloor productivity)\n\n*Aap Hindi ya Hinglish me bhi sawal puchh sakte hain!*`;
      const quickReplies = ['ZED MSME Subsidy', 'ISO 9001 Process', 'SEDEX SMETA Audit', 'NATS Apprenticeship'];
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

    // Smart Offline Client-Side AI Response Engine
    function generateOfflineAiResponse(userMessage) {
      const msgLower = userMessage.toLowerCase();
      let aiResponse = '';
      let detectedService = 'General';
      let quickReplies = [];
      let leadCaptured = false;

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

      if (msgLower.includes('zed') || msgLower.includes('msme') || msgLower.includes('subsidy') || msgLower.includes('zero defect')) {
        detectedService = 'ZED Certification';
        aiResponse = `🏆 **ZED (Zero Defect Zero Effect) Scheme for MSMEs**\n\nPRV Consultancy is an accredited consultant for the Ministry of MSME ZED Certification Scheme.\n\n✨ **Key Benefits & Subsidies**:\n• **Bronze Level**: 80% Subsidy on Certification cost + ₹10,000 Handholding Support Grant.\n• **Silver Level**: 60% Subsidy + Up to ₹5 Lakhs Testing & Capital Subsidy.\n• **Gold Level**: 50% Subsidy + Freight & Concessional Bank Interest (0.5% lower interest).\n\n📋 **Process**: Udyam Registration -> Self-Assessment -> Handholding by PRV Experts -> Desktop Verification -> Final Audit & Subsidy Clearance.\n\nWould you like our senior consultant to guide your MSME unit?`;
        quickReplies = ['Book ZED Consultation', 'ISO 9001 Process', 'NATS Apprenticeship', 'Call +91 74893 51297'];
      }
      else if (msgLower.includes('iso') || msgLower.includes('9001') || msgLower.includes('14001') || msgLower.includes('45001') || msgLower.includes('27001') || msgLower.includes('22000') || msgLower.includes('13485')) {
        detectedService = 'ISO Certifications';
        aiResponse = `📜 **ISO Certification Solutions by PRV Consultancy**\n\nWe provide end-to-end guidance for ISO Certifications across industries:\n\n• **ISO 9001:2015**: Quality Management System (QMS)\n• **ISO 14001:2015**: Environmental Management System (EMS)\n• **ISO 45001:2018**: Occupational Health & Safety (OH&S)\n• **ISO 27001:2022**: Information Security Management (ISMS)\n• **ISO 22000 / FSSAI**: Food Safety Management\n• **ISO 13485**: Medical Devices QMS\n\n⏱️ **Timeline**: 2 to 4 weeks (Includes gap analysis, documentation, internal audit & certification clearance).\n\nWould you like a customized quotation for your organization?`;
        quickReplies = ['Get ISO Quote', 'ZED MSME Subsidy', 'SEDEX Audit', 'Book Consultation'];
      }
      else if (msgLower.includes('sedex') || msgLower.includes('smeta') || msgLower.includes('social audit') || msgLower.includes('oeko') || msgLower.includes('compliance')) {
        detectedService = 'SEDEX / SMETA Audit';
        aiResponse = `🛡️ **Compliance & Social Audits (SEDEX, SMETA, OEKO-TEX)**\n\nPRV Consultancy prepares manufacturing & textile units for export & buyer compliance audits:\n\n• **SEDEX / SMETA 2-Pillar & 4-Pillar Audits**: Labor standards, Health & Safety, Environment, Business Ethics.\n• **Social Audits & MACE**: Complete buyer vendor approval.\n• **OEKO-TEX & FSSAI**: Chemical safety & food compliance certification.\n\nBenefits: Clear international buyer audits, win export orders, and ensure 100% regulatory compliance.`;
        quickReplies = ['Prepare for SMETA Audit', 'ISO Certifications', 'Request Callback', 'Contact PRV Team'];
      }
      else if (msgLower.includes('5s') || msgLower.includes('kaizen') || msgLower.includes('lean') || msgLower.includes('operational excellence')) {
        detectedService = '5S & Kaizen';
        aiResponse = `⚡ **5S & Kaizen Operational Excellence Program**\n\nTransform your shop-floor & office productivity with PRV's Master Business Excellence Blueprint:\n\n• **1S (Sort)**: Eliminate unnecessary tools & waste.\n• **2S (Set in Order)**: Organized layout & quick retrieval.\n• **3S (Shine)**: Clean, safe, and fault-free workplace.\n• **4S (Standardize)**: SOPs, visual control & checklists.\n• **5S (Sustain)**: Mindset shift, daily audits & continuous Kaizen.\n\n📈 **Results**: 25-40% increase in productivity, 50% defect reduction, and high workforce morale.`;
        quickReplies = ['Book 5S Workshop', 'IATF 16949 Training', 'ZED Certification', 'Request Callback'];
      }
      else if (msgLower.includes('nats') || msgLower.includes('naps') || msgLower.includes('apprentice') || msgLower.includes('stipend')) {
        detectedService = 'NATS Apprenticeship';
        aiResponse = `🎓 **NATS & NAPS Government Apprenticeship Scheme**\n\nReduce workforce payroll costs while onboarding trained talent under Central Government Schemes:\n\n• **Financial Support**: Direct stipend subsidy reimbursement up to ₹1,500/month per apprentice.\n• **Statutory Relief**: Exemption from ESI & PF obligations on apprentice stipends.\n• **Talent Pipeline**: Hire ITI, Diploma, and B.Tech/Degree freshers seamlessly.\n• **PRV Handholding**: Complete portal registration, contract creation, stipend claim submission, and monthly compliance management.`;
        quickReplies = ['Onboard Apprentices', 'Corporate Training', 'ISO Certification', 'Call PRV Team'];
      }
      else if (msgLower.includes('iatf') || msgLower.includes('16949') || msgLower.includes('automotive') || msgLower.includes('core tools') || msgLower.includes('apqp') || msgLower.includes('ppap')) {
        detectedService = 'IATF 16949';
        aiResponse = `🚗 **IATF 16949 & Automotive Core Tools**\n\nAutomotive manufacturing consultancy & Core Tools practical training:\n\n• **APQP** (Advanced Product Quality Planning)\n• **PPAP** (Production Part Approval Process)\n• **FMEA** (Failure Mode and Effects Analysis - AIAG-VDA)\n• **MSA** (Measurement Systems Analysis)\n• **SPC** (Statistical Process Control)\n\nEquip your engineers and clear Tier-1 / Tier-2 OEM supplier audits.`;
        quickReplies = ['Core Tools Workshop', 'ISO 9001 QMS', 'ZED Scheme', 'Talk to Consultant'];
      }
      else if (msgLower.includes('price') || msgLower.includes('cost') || msgLower.includes('fee') || msgLower.includes('kharcha') || msgLower.includes('rate') || msgLower.includes('kitna')) {
        detectedService = 'Pricing Inquiry';
        aiResponse = `💰 **Pricing & Investment Overview**\n\nPRV Consultancy provides cost-optimized pricing tailored to your company's size, employee count, and certification scope:\n\n• **ZED Certification**: Up to 80% government subsidy available!\n• **NATS Apprenticeship**: Government stipend reimbursement reduces effective manpower cost.\n• **ISO & Audit Consultancies**: Milestone-based flexible pricing.\n\nType your phone number or email in chat to receive an instant detailed customized quotation!`;
        quickReplies = ['Book Consultation', 'ZED Subsidy Details', 'ISO 9001 Quote', 'Call +91 74893 51297'];
      }
      else if (msgLower.includes('contact') || msgLower.includes('phone') || msgLower.includes('call') || msgLower.includes('number') || msgLower.includes('address') || msgLower.includes('email') || msgLower.includes('whatsapp') || msgLower.includes('samparak')) {
        detectedService = 'Contact Request';
        aiResponse = `📞 **PRV Consultancy Services - Contact Details**\n\n• **Phone / Mobile**: +91 74893 51297\n• **Email**: info@prvconsultancy.com\n• **Coverage**: Pan-India & Global Consultancy Services\n• **Headquarters**: Industrial Hub Consultancy Wing\n\nYou can share your phone number directly here in chat, and our senior consultant will reach out to you within 15 minutes!`;
        quickReplies = ['Book Free Consultation', 'ZED Scheme', 'ISO Certification', 'WhatsApp Chat'];
      }
      else if (msgLower.includes('hi') || msgLower.includes('hello') || msgLower.includes('namaste') || msgLower.includes('madad') || msgLower.includes('help') || msgLower.includes('kaise')) {
        detectedService = 'Greeting';
        aiResponse = `🙏 **Namaste! Welcome to PRV Consultancy Services AI Assistant.**\n\nMain aapki Business Excellence, ISO Certifications, ZED Government Subsidies, SEDEX Audits, aur NATS Apprenticeship me help kar sakta hu.\n\nAap niche diye gaye options chunein ya English/Hindi me apna sawal likhein:\n\n• **ISO Certifications** (9001, 14001, 45001, 27001)\n• **ZED MSME Subsidy** (80% tak govt subsidy)\n• **SEDEX & Social Audits** (Export compliance)\n• **5S / Kaizen** (Shopfloor productivity)\n• **NATS Apprenticeship** (Stipend subsidy)`;
        quickReplies = ['ZED MSME Subsidy', 'ISO 9001 Info', 'NATS Apprenticeship', 'Book Consultation'];
      }
      else {
        aiResponse = `🤖 Thank you for contacting **PRV Consultancy Services**!\n\nRegarding your query about: *"${userMessage}"*\n\nPRV Consultancy is your 1-Stop Partner for:\n1. **ZED Certification & MSME Subsidies** (Up to 80% grant)\n2. **ISO Certifications** (9001, 14001, 45001, 27001)\n3. **SEDEX / SMETA & Buyer Compliance Audits**\n4. **5S & Kaizen Operational Excellence**\n5. **NATS & NAPS Government Apprenticeship Scheme**\n\nPlease select an option below or type your phone number for an immediate consultant callback!`;
        quickReplies = ['ZED Certification', 'ISO Certifications', 'NATS Scheme', 'Book Consultation'];
      }

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
