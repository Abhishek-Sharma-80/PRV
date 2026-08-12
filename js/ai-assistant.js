/**
 * PRV Consultancy Services - Ultra Premium AI Consultant Frontend Engine
 * Powered by Groq LLM (llama-3.3-70b-versatile)
 * Handles both Floating Chat Widget AND Full Page Embedded AI Advisor (#ai-consultant)
 */

(function () {
  'use strict';

  // Inject UI Styles for Floating Chat Widget
  const style = document.createElement('style');
  style.textContent = `
    /* Floating Toggle Button */
    #prv-ai-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(0, 242, 254, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    #prv-ai-toggle:hover {
      transform: scale(1.08) translateY(-3px);
      box-shadow: 0 15px 35px rgba(0, 242, 254, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.5);
    }

    #prv-ai-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid #0f172a;
      box-shadow: 0 0 8px #ef4444;
    }

    /* Main Chat Container */
    #prv-ai-window {
      position: fixed;
      bottom: 98px;
      right: 24px;
      z-index: 9999;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 242, 254, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #prv-ai-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* Header */
    .prv-ai-header {
      padding: 14px 18px;
      background: linear-gradient(90deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .prv-ai-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .prv-ai-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 12px rgba(0, 242, 254, 0.4);
    }

    .prv-ai-title {
      font-size: 14px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.01em;
    }

    .prv-ai-status {
      font-size: 11px;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 1px;
    }

    .prv-ai-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 10px #22c55e;
    }

    .prv-ai-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .prv-ai-close:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #f8fafc;
    }

    /* Message Area */
    .prv-ai-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* Custom Scrollbar */
    .prv-ai-messages::-webkit-scrollbar,
    #full-ai-chat-messages::-webkit-scrollbar {
      width: 5px;
    }
    .prv-ai-messages::-webkit-scrollbar-track,
    #full-ai-chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .prv-ai-messages::-webkit-scrollbar-thumb,
    #full-ai-chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 10px;
    }

    .prv-ai-msg {
      max-width: 88%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.55;
      word-break: break-word;
      animation: prvFadeIn 0.3s ease-out;
    }

    @keyframes prvFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .prv-ai-msg.bot {
      align-self: flex-start;
      background: rgba(30, 41, 59, 0.85);
      color: #e2e8f0;
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-top-left-radius: 4px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .prv-ai-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: #ffffff;
      border-top-right-radius: 4px;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
    }

    .prv-ai-msg strong {
      color: #38bdf8;
    }
    .prv-ai-msg.user strong {
      color: #ffffff;
    }
    .prv-ai-msg code {
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: #38bdf8;
    }

    /* Typing Dots */
    .prv-ai-typing {
      align-self: flex-start;
      padding: 12px 18px;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 16px;
      border-top-left-radius: 4px;
      display: flex;
      gap: 5px;
    }
    .prv-ai-typing span {
      width: 6px;
      height: 6px;
      background: #38bdf8;
      border-radius: 50%;
      animation: prvDotPulse 1.4s infinite ease-in-out both;
    }
    .prv-ai-typing span:nth-child(1) { animation-delay: -0.32s; }
    .prv-ai-typing span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes prvDotPulse {
      0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Quick Reply Chips */
    .prv-ai-chips {
      padding: 10px 14px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      background: rgba(15, 23, 42, 0.8);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .prv-ai-chips::-webkit-scrollbar {
      height: 0px;
    }

    .prv-ai-chip {
      white-space: nowrap;
      padding: 6px 14px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 500;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .prv-ai-chip:hover {
      background: rgba(56, 189, 248, 0.25);
      border-color: #38bdf8;
      transform: translateY(-1px);
    }

    /* Input Bar */
    .prv-ai-footer {
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.98);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .prv-ai-input {
      flex: 1;
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 10px 16px;
      color: #f8fafc;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .prv-ai-input::placeholder {
      color: #64748b;
    }

    .prv-ai-input:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
    }

    .prv-ai-send {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #0f172a;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
      flex-shrink: 0;
    }

    .prv-ai-send:hover {
      transform: scale(1.06);
      box-shadow: 0 6px 20px rgba(0, 242, 254, 0.5);
    }
  `;
  document.head.appendChild(style);

  // SVG Icons
  const botIconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>`;
  const sendIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  const closeIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  // Create Floating UI Structure
  const container = document.createElement('div');
  container.innerHTML = `
    <div id="prv-ai-toggle" title="PRV AI Senior Consultant">
      ${botIconSvg}
      <span id="prv-ai-badge"></span>
    </div>

    <div id="prv-ai-window">
      <div class="prv-ai-header">
        <div class="prv-ai-header-left">
          <div class="prv-ai-avatar">${botIconSvg}</div>
          <div>
            <div class="prv-ai-title">PRV AI Senior Consultant</div>
            <div class="prv-ai-status">
              <span class="prv-ai-dot"></span> Online (Groq LLM Powered)
            </div>
          </div>
        </div>
        <div class="prv-ai-close" id="prv-ai-close">${closeIconSvg}</div>
      </div>

      <div class="prv-ai-messages" id="prv-ai-messages">
        <div class="prv-ai-msg bot">
          🏢 <strong>Welcome to PRV Consultancy Services</strong><br><br>
          I am your <strong>PRV Senior AI Business Consultant</strong> powered by Groq Intelligence.<br><br>
          I specialize in:<br>
          • <strong>ISO Certifications</strong> (9001, 14001, 45001, 27001, 22000, 13485)<br>
          • <strong>ZED MSME Subsidy</strong> (Up to 80% Grant)<br>
          • <strong>IATF 16949 & Automotive Core Tools</strong><br>
          • <strong>FSSAI License & SEDEX SMETA Audits</strong><br>
          • <strong>NATS / NAPS Manpower Cost Optimization</strong><br><br>
          Please share your company's industry or goal, and I will recommend the best solution for your business!
        </div>
      </div>

      <div class="prv-ai-chips" id="prv-ai-chips">
        <div class="prv-ai-chip">What is ISO 9001?</div>
        <div class="prv-ai-chip">ZED Subsidy Details</div>
        <div class="prv-ai-chip">Automotive Certifications</div>
        <div class="prv-ai-chip">SEDEX SMETA Guide</div>
        <div class="prv-ai-chip">5S Productivity Improvement</div>
      </div>

      <div class="prv-ai-footer">
        <input type="text" id="prv-ai-input" class="prv-ai-input" placeholder="Ask PRV Consultant..." autocomplete="off">
        <button class="prv-ai-send" id="prv-ai-send">${sendIconSvg}</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Bind Floating Widget Elements
  const toggleBtn = document.getElementById('prv-ai-toggle');
  const win = document.getElementById('prv-ai-window');
  const closeBtn = document.getElementById('prv-ai-close');
  const badge = document.getElementById('prv-ai-badge');
  const msgsContainer = document.getElementById('prv-ai-messages');
  const inputEl = document.getElementById('prv-ai-input');
  const sendBtn = document.getElementById('prv-ai-send');
  const chipsContainer = document.getElementById('prv-ai-chips');

  let history = [];
  const sessionId = 'session_' + Date.now();

  function toggleWindow() {
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
      if (badge) badge.style.display = 'none';
      inputEl.focus();
    }
  }

  toggleBtn.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', toggleWindow);

  // Format Markdown Text safely
  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/###\s+(.*)/g, '<strong>$1</strong>')
      .replace(/##\s+(.*)/g, '<strong>$1</strong>')
      .replace(/#\s+(.*)/g, '<strong>$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function appendMsg(containerEl, role, text) {
    const el = document.createElement('div');
    el.className = `prv-ai-msg ${role}`;
    el.innerHTML = formatMarkdown(text);
    containerEl.appendChild(el);
    containerEl.scrollTop = containerEl.scrollHeight;
  }

  function showTyping(containerEl) {
    const el = document.createElement('div');
    el.className = 'prv-ai-typing';
    el.id = 'prv-ai-typing-' + Math.random().toString(36).substring(7);
    el.innerHTML = '<span></span><span></span><span></span>';
    containerEl.appendChild(el);
    containerEl.scrollTop = containerEl.scrollHeight;
    return el.id;
  }

  function hideTyping(id) {
    const typing = document.getElementById(id);
    if (typing) typing.remove();
  }

  function renderChips(replies) {
    chipsContainer.innerHTML = '';
    if (Array.isArray(replies) && replies.length > 0) {
      replies.forEach(txt => {
        const chip = document.createElement('div');
        chip.className = 'prv-ai-chip';
        chip.textContent = txt;
        chip.addEventListener('click', () => {
          inputEl.value = txt;
          sendUserMessage();
        });
        chipsContainer.appendChild(chip);
      });
    }
  }

  // Bind initial floating chips
  Array.from(chipsContainer.children).forEach(chip => {
    chip.addEventListener('click', () => {
      inputEl.value = chip.textContent;
      sendUserMessage();
    });
  });

  async function sendUserMessage() {
    const userText = inputEl.value.trim();
    if (!userText) return;

    inputEl.value = '';
    appendMsg(msgsContainer, 'user', userText);
    const typingId = showTyping(msgsContainer);

    history.push({ role: 'user', content: userText });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          sessionId: sessionId,
          history: history
        })
      });

      const data = await res.json();
      hideTyping(typingId);

      if (data && data.answer) {
        appendMsg(msgsContainer, 'bot', data.answer);
        history.push({ role: 'assistant', content: data.answer });
        if (data.quickReplies) {
          renderChips(data.quickReplies);
        }
      } else {
        appendMsg(msgsContainer, 'bot', 'Apologies, I could not process your request. Please try again.');
      }
    } catch (err) {
      console.error('[AI Chat] Request failed:', err);
      hideTyping(typingId);
      appendMsg(msgsContainer, 'bot', 'I am experiencing a temporary connection issue. Please try again in a moment.');
    }
  }

  sendBtn.addEventListener('click', sendUserMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendUserMessage();
    }
  });

  /* ==========================================================================
     FULL PAGE EMBEDDED AI ADVISOR SECTION HANDLER (#view-ai-consultant)
     ========================================================================== */
  function initFullPageAiAdvisor() {
    const fullForm = document.getElementById('full-ai-chat-form');
    const fullInput = document.getElementById('full-ai-input');
    const fullMsgs = document.getElementById('full-ai-chat-messages');
    const fullChips = document.getElementById('full-ai-chips');

    if (!fullForm || !fullInput || !fullMsgs) return;

    let fullHistory = [];
    const fullSessionId = 'full_session_' + Date.now();

    async function sendFullChatMessage(userText) {
      if (!userText) return;

      // Append user msg to full page container
      const userDiv = document.createElement('div');
      userDiv.className = 'flex justify-end gap-3 animate-fade-up';
      userDiv.innerHTML = `
        <div class="bg-gradient-to-r from-sky-600 to-blue-600 text-white p-4 rounded-2xl max-w-xl text-sm leading-relaxed shadow-lg">
          ${userText}
        </div>
      `;
      fullMsgs.appendChild(userDiv);
      fullMsgs.scrollTop = fullMsgs.scrollHeight;

      // Append typing indicator
      const typingId = showTyping(fullMsgs);
      fullHistory.push({ role: 'user', content: userText });

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            sessionId: fullSessionId,
            history: fullHistory
          })
        });

        const data = await res.json();
        hideTyping(typingId);

        if (data && data.answer) {
          const botDiv = document.createElement('div');
          botDiv.className = 'flex gap-3 animate-fade-up';
          botDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center text-xs flex-shrink-0">
              ${botIconSvg}
            </div>
            <div class="glass-panel p-4 rounded-2xl max-w-xl text-sm leading-relaxed border border-border-glass text-on-surface">
              ${formatMarkdown(data.answer)}
            </div>
          `;
          fullMsgs.appendChild(botDiv);
          fullMsgs.scrollTop = fullMsgs.scrollHeight;
          fullHistory.push({ role: 'assistant', content: data.answer });
        }
      } catch (err) {
        hideTyping(typingId);
        console.error('[Full AI Chat] Error:', err);
      }
    }

    fullForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = fullInput.value.trim();
      if (txt) {
        fullInput.value = '';
        sendFullChatMessage(txt);
      }
    });

    if (fullChips) {
      fullChips.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const prompt = btn.getAttribute('data-prompt') || btn.textContent.trim();
          sendFullChatMessage(prompt);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullPageAiAdvisor);
  } else {
    initFullPageAiAdvisor();
  }

})();
