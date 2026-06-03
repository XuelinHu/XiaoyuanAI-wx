(function () {
  const backendConfig = {
    baseUrl: 'https://api.xiaoyuan-care.com/v1',
    timeout: 8000,
    tenantCode: 'xiaoyuan-mini',
    useLocalFallback: true,
  };

  function getInitialView() {
    const dataView = document.body && document.body.dataset ? document.body.dataset.view : '';
    if (dataView === 'history' || dataView === 'profile' || dataView === 'chat') {
      return dataView;
    }
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'history' || view === 'profile' || view === 'chat') {
      return view;
    }
    return 'chat';
  }

  const state = {
    currentView: getInitialView(),
    conversationId: '',
    assistantStatus: '在线陪伴中',
    assistantIntro: '',
    messages: [],
    hasMoreHistory: false,
    nextMessageId: 1,
    sending: false,
    sessions: [],
    profileItems: [],
  };

  const elements = {
    assistantAvatar: document.getElementById('assistantAvatar'),
    assistantStatus: document.getElementById('assistantStatus'),
    assistantDialog: document.getElementById('assistantDialog'),
    assistantIntroText: document.getElementById('assistantIntroText'),
    closeDialogButton: document.getElementById('closeDialogButton'),
    chatView: document.getElementById('chatView'),
    historyView: document.getElementById('historyView'),
    profileView: document.getElementById('profileView'),
    tabItems: Array.from(document.querySelectorAll('.tab-item')),
    loadHistoryButton: document.getElementById('loadHistoryButton'),
    historyAnchor: document.getElementById('historyAnchor'),
    messageScroll: document.getElementById('messageScroll'),
    messageList: document.getElementById('messageList'),
    composerInput: document.getElementById('composerInput'),
    sendButton: document.getElementById('sendButton'),
    sessionList: document.getElementById('sessionList'),
    profileList: document.getElementById('profileList'),
  };

  function getTimeLabel() {
    const date = new Date();
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function buildAssistantReply(content) {
    if (content.includes('害怕') || content.includes('担心')) {
      return '害怕和担心都是真实反应，不代表你不够坚强。你可以先说说现在最担心的那件事，我会陪你一起梳理。';
    }
    if (content.includes('睡') || content.includes('失眠')) {
      return '失眠时情绪容易被放大，先不用要求自己马上放松。你可以先把脑子里最吵的那个念头说出来，我们一起把它放到更容易处理的位置。';
    }
    if (content.includes('家人') || content.includes('爸爸') || content.includes('妈妈')) {
      return '你在意家人的感受，也说明你一直在努力保护关系。可以先尝试表达“我现在有点难受，但不需要你立刻替我解决”，沟通会轻一些。';
    }
    return '我看到你已经把感受说出来了，这一步很重要。你可以继续说当下最压着你的那个点，我会接着陪你往下梳理。';
  }

  function createChatBootstrap() {
    return {
      conversationId: 'conv-demo-001',
      assistantProfile: {
        name: '小元',
        roleTitle: '癌症情绪支持陪伴助手',
        statusText: '在线陪伴中',
        intro:
          '小元提供情绪支持会话、历史浏览和个人偏好服务。HTML5 展示页已接入会话初始化、消息发送、历史查询和个人配置接口的同构交互逻辑。',
      },
      messages: [
        {
          id: 101,
          role: 'assistant',
          content: '你好，我是小元。这里是你的情绪支持会话空间，你可以直接说出现在最难受的感受。',
          time: '20:30',
        },
        {
          id: 102,
          role: 'assistant',
          content: '如果你愿意，我们可以从“今天最压着你的那件事”开始聊。',
          time: '20:31',
        },
      ],
      hasMoreHistory: true,
      nextMessageId: 103,
    };
  }

  function createHistoryMessages() {
    return [
      {
        id: 91,
        role: 'assistant',
        content: '你不需要一个人把所有情绪都扛住，我们可以先从最难受的那部分开始。',
        time: '20:25',
      },
      {
        id: 92,
        role: 'user',
        content: '这几天总觉得很累，也不知道怎么和家里人说。',
        time: '20:26',
      },
      {
        id: 93,
        role: 'assistant',
        content: '能说出这句话已经很不容易了。我们先不着急解决全部问题，先聊你最怕他们听到什么。',
        time: '20:27',
      },
    ];
  }

  function createSessionList() {
    return [
      {
        id: 1,
        title: '夜间情绪安抚',
        preview: '围绕睡眠压力、复查担忧和与家人的沟通方式进行了支持会话。',
        time: '昨天 22:18',
        mood: '需要安抚',
        moodClass: 'session-tag--warm',
      },
      {
        id: 2,
        title: '复诊前焦虑整理',
        preview: '帮助梳理复诊前的担忧点，并形成待沟通问题清单。',
        time: '周四 18:46',
        mood: '慢慢平稳',
        moodClass: 'session-tag--calm',
      },
      {
        id: 3,
        title: '家庭沟通支持',
        preview: '整理与家属沟通时的表达顺序和情绪边界，减轻“怕拖累别人”的压力。',
        time: '周二 09:12',
        mood: '持续支持',
        moodClass: 'session-tag--warm',
      },
    ];
  }

  function createProfileCards() {
    return [
      {
        title: '会话偏好',
        desc: '设置小元回复风格、安抚节奏、重点提醒和是否优先共情。',
        action: '管理',
      },
      {
        title: '紧急支持',
        desc: '维护热线、医院联系人和一键求助入口，便于在高压场景中快速触达支持资源。',
        action: '查看',
      },
      {
        title: '消息与提醒',
        desc: '管理复诊提醒、情绪记录、睡眠观察和系统通知策略。',
        action: '配置',
      },
    ];
  }

  function createChatReply(payload) {
    return {
      replyMessage: {
        id: Date.now(),
        role: 'assistant',
        content: buildAssistantReply(payload.content || ''),
        time: getTimeLabel(),
        loading: false,
      },
      conversationId: payload.conversationId || 'conv-demo-001',
      assistantStatus: '在线陪伴中',
    };
  }

  async function request(options) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), options.timeout || backendConfig.timeout);
    try {
      const method = options.method || 'GET';
      const isGet = method === 'GET';
      const query = isGet && options.data ? `?${new URLSearchParams(options.data).toString()}` : '';
      const response = await fetch(`${backendConfig.baseUrl}${options.url}${query}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-code': backendConfig.tenantCode,
          ...(options.headers || {}),
        },
        body: isGet ? undefined : JSON.stringify(options.data || {}),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error('接口请求失败');
      }
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function requestWithFallback(options) {
    try {
      return await request(options);
    } catch (error) {
      if (!backendConfig.useLocalFallback || typeof options.fallback !== 'function') {
        throw error;
      }
      return options.fallback(error);
    }
  }

  const chatService = {
    fetchConversationBootstrap() {
      return requestWithFallback({
        url: '/conversation/bootstrap',
        method: 'GET',
        fallback: () => createChatBootstrap(),
      });
    },
    fetchAssistantProfile() {
      return requestWithFallback({
        url: '/assistant/profile',
        method: 'GET',
        fallback: () => createChatBootstrap().assistantProfile,
      });
    },
    fetchConversationHistory(payload) {
      return requestWithFallback({
        url: '/conversation/history',
        method: 'GET',
        data: payload,
        fallback: () => ({ messages: createHistoryMessages(), hasMoreHistory: false }),
      });
    },
    sendConversationMessage(payload) {
      return requestWithFallback({
        url: '/conversation/message',
        method: 'POST',
        data: payload,
        fallback: () => createChatReply(payload),
      });
    },
  };

  const historyService = {
    fetchSessionList() {
      return requestWithFallback({
        url: '/conversation/list',
        method: 'GET',
        fallback: () => ({ sessions: createSessionList() }),
      });
    },
  };

  const profileService = {
    fetchProfileCards() {
      return requestWithFallback({
        url: '/profile/cards',
        method: 'GET',
        fallback: () => ({ items: createProfileCards() }),
      });
    },
  };

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderTabs() {
    elements.tabItems.forEach((button) => {
      const active = button.dataset.view === state.currentView;
      button.classList.toggle('tab-item--active', active);
    });
    elements.chatView.classList.toggle('view-panel--active', state.currentView === 'chat');
    elements.historyView.classList.toggle('view-panel--active', state.currentView === 'history');
    elements.profileView.classList.toggle('view-panel--active', state.currentView === 'profile');
  }

  function renderMessages() {
    elements.assistantStatus.textContent = state.assistantStatus;
    elements.historyAnchor.hidden = !state.hasMoreHistory;
    elements.messageList.innerHTML = state.messages
      .map((message) => {
        const loadingHtml = `
          <div class="typing-dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        `;
        return `
          <div class="message-row message-row--${message.role}">
            <div class="bubble bubble--${message.role} ${message.loading ? 'bubble--loading' : ''}" data-copy="${escapeHtml(
              message.content || ''
            )}">
              ${message.loading ? loadingHtml : `<span class="bubble-text">${escapeHtml(message.content || '')}</span>`}
            </div>
            <span class="message-time">${escapeHtml(message.time || '')}</span>
          </div>
        `;
      })
      .join('');

    elements.messageList.querySelectorAll('.bubble').forEach((bubble) => {
      bubble.addEventListener('contextmenu', async (event) => {
        event.preventDefault();
        const content = bubble.dataset.copy || '';
        if (!content) {
          return;
        }
        try {
          await navigator.clipboard.writeText(content);
          window.alert('消息已复制');
        } catch (error) {
          window.alert(content);
        }
      });
    });

    window.requestAnimationFrame(() => {
      elements.messageScroll.scrollTop = elements.messageScroll.scrollHeight;
    });
  }

  function renderSessions() {
    elements.sessionList.innerHTML = state.sessions
      .map(
        (item) => `
          <article class="session-card card">
            <div class="session-main">
              <h3 class="session-title">${escapeHtml(item.title)}</h3>
              <p class="session-desc">${escapeHtml(item.preview)}</p>
            </div>
            <div class="session-meta">
              <span class="session-time">${escapeHtml(item.time)}</span>
              <span class="session-tag ${escapeHtml(item.moodClass)}">${escapeHtml(item.mood)}</span>
            </div>
          </article>
        `
      )
      .join('');
  }

  function renderProfileItems() {
    elements.profileList.innerHTML = state.profileItems
      .map(
        (item) => `
          <article class="profile-item card">
            <div class="profile-item__main">
              <h3 class="profile-item__title">${escapeHtml(item.title)}</h3>
              <p class="profile-item__desc">${escapeHtml(item.desc)}</p>
            </div>
            <span class="profile-item__action">${escapeHtml(item.action)}</span>
          </article>
        `
      )
      .join('');
  }

  async function initializeChat() {
    const [bootstrap, profile] = await Promise.all([
      chatService.fetchConversationBootstrap(),
      chatService.fetchAssistantProfile(),
    ]);
    state.conversationId = bootstrap.conversationId || '';
    state.assistantStatus = profile.statusText || bootstrap.assistantStatus || '在线陪伴中';
    state.assistantIntro = profile.intro || '';
    state.messages = bootstrap.messages || [];
    state.hasMoreHistory = Boolean(bootstrap.hasMoreHistory);
    state.nextMessageId = bootstrap.nextMessageId || 1;
    renderMessages();
  }

  async function loadHistory() {
    if (!state.hasMoreHistory) {
      window.alert('没有更多历史了');
      return;
    }
    const response = await chatService.fetchConversationHistory({
      conversationId: state.conversationId,
      anchorMessageId: state.messages[0] ? state.messages[0].id : '',
    });
    state.messages = (response.messages || []).concat(state.messages);
    state.hasMoreHistory = Boolean(response.hasMoreHistory);
    renderMessages();
  }

  async function sendMessage() {
    const content = elements.composerInput.value.trim();
    if (!content || state.sending) {
      return;
    }
    const baseId = state.nextMessageId;
    state.nextMessageId += 2;
    state.sending = true;
    state.assistantStatus = '正在思考';
    elements.sendButton.disabled = true;
    elements.sendButton.textContent = '发送中';
    state.messages.push(
      { id: baseId, role: 'user', content, time: getTimeLabel() },
      { id: baseId + 1, role: 'assistant', content: '...', time: getTimeLabel(), loading: true }
    );
    elements.composerInput.value = '';
    renderMessages();

    try {
      const response = await chatService.sendConversationMessage({
        conversationId: state.conversationId,
        content,
        sceneCode: 'emotion_support_chat',
      });
      state.conversationId = response.conversationId || state.conversationId;
      state.assistantStatus = response.assistantStatus || '在线陪伴中';
      state.messages = state.messages.map((item) => {
        if (item.id === baseId + 1) {
          return response.replyMessage || item;
        }
        return item;
      });
    } catch (error) {
      state.assistantStatus = '在线陪伴中';
      state.messages = state.messages.map((item) => {
        if (item.id === baseId + 1) {
          return { id: item.id, role: 'assistant', content: '消息发送失败，请稍后重试。', time: getTimeLabel() };
        }
        return item;
      });
    } finally {
      state.sending = false;
      elements.sendButton.disabled = false;
      elements.sendButton.textContent = '发送';
      renderMessages();
    }
  }

  async function initializeHistory() {
    const response = await historyService.fetchSessionList();
    state.sessions = response.sessions || [];
    renderSessions();
  }

  async function initializeProfile() {
    const response = await profileService.fetchProfileCards();
    state.profileItems = response.items || [];
    renderProfileItems();
  }

  function bindEvents() {
    elements.tabItems.forEach((button) => {
      button.addEventListener('click', () => {
        state.currentView = button.dataset.view;
        renderTabs();
      });
    });

    elements.assistantAvatar.addEventListener('click', () => {
      elements.assistantIntroText.textContent =
        state.assistantIntro || '小元提供情绪支持会话、历史浏览和个人偏好配置服务。';
      elements.assistantDialog.showModal();
    });

    elements.closeDialogButton.addEventListener('click', () => {
      elements.assistantDialog.close();
    });

    elements.loadHistoryButton.addEventListener('click', loadHistory);
    elements.historyAnchor.addEventListener('click', loadHistory);
    elements.sendButton.addEventListener('click', sendMessage);
    elements.composerInput.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        sendMessage();
      }
    });
  }

  async function initialize() {
    bindEvents();
    renderTabs();
    await Promise.all([initializeChat(), initializeHistory(), initializeProfile()]);
  }

  initialize().catch((error) => {
    console.error(error);
    window.alert('HTML5 页面初始化失败，请检查浏览器控制台。');
  });
})();
