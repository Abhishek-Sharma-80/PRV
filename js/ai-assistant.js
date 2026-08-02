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

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (data.success && data.response) {
          appendMessage('bot', data.response, data.quickReplies, data.leadCaptured);
          playChatSound('receive');
          speakText(data.response);
        } else {
          appendMessage('bot', '⚠️ Sorry, I encountered a minor server issue. Please try again or call our team at +91 98765 43210.');
        }
      } catch (err) {
        removeTypingIndicator();
        console.error('Error contacting AI service:', err);
        appendMessage('bot', '⚠️ Network error communicating with PRV AI Server. Please ensure local server is running.');
      }
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
