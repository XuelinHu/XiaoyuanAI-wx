const {
  fetchConversationBootstrap,
  fetchAssistantProfile,
  fetchConversationHistory,
  sendConversationMessage,
} = require('../../services/chat');

Page({
  data: {
    assistantStatus: '在线陪伴中',
    assistantIntro: '',
    conversationId: '',
    messages: [],
    draft: '',
    scrollIntoView: '',
    sending: false,
    bootstrapping: false,
    keyboardHeight: 108,
    scrollExtraHeight: 0,
    hasMoreHistory: false,
    nextMessageId: 1,
  },

  onLoad() {
    this.setupKeyboardListener();
    this.initializeConversation();
  },

  onUnload() {
    this.clearReplyTimer();
    if (this.handleKeyboardHeightChange && wx.offKeyboardHeightChange) {
      wx.offKeyboardHeightChange(this.handleKeyboardHeightChange);
    }
  },

  setupKeyboardListener() {
    if (!wx.onKeyboardHeightChange) {
      return;
    }
    this.handleKeyboardHeightChange = (result) => {
      const height = result && result.height ? result.height : 0;
      this.setData({
        keyboardHeight: height > 0 ? height + 16 : 108,
        scrollExtraHeight: height > 0 ? height : 0,
      });
      this.scrollToBottom();
    };
    wx.onKeyboardHeightChange(this.handleKeyboardHeightChange);
  },

  handleInput(event) {
    this.setData({ draft: event.detail.value });
  },

  handleFocus() {
    this.scrollToBottom();
  },

  handleBlur() {
    this.setData({
      keyboardHeight: 108,
      scrollExtraHeight: 0,
    });
  },

  async initializeConversation() {
    this.setData({ bootstrapping: true });
    try {
      const [bootstrap, profile] = await Promise.all([
        fetchConversationBootstrap(),
        fetchAssistantProfile(),
      ]);
      this.setData({
        assistantStatus: profile.statusText || bootstrap.assistantStatus || '在线陪伴中',
        assistantIntro: profile.intro || '',
        conversationId: bootstrap.conversationId || '',
        messages: bootstrap.messages || [],
        hasMoreHistory: !!bootstrap.hasMoreHistory,
        nextMessageId: bootstrap.nextMessageId || this.getNextMessageId(bootstrap.messages || []),
      });
      this.scrollToBottom();
    } catch (error) {
      wx.showToast({
        title: '会话初始化失败',
        icon: 'none',
      });
    } finally {
      this.setData({ bootstrapping: false });
    }
  },

  showAssistantIntro() {
    wx.showModal({
      title: '关于小元',
      content:
        this.data.assistantIntro ||
        '小元提供情绪支持会话服务，支持会话初始化、消息发送、历史查询和个性化设置同步。',
      showCancel: false,
      confirmText: '知道了',
    });
  },

  async loadOlderMessages() {
    if (!this.data.hasMoreHistory) {
      wx.showToast({
        title: '没有更多历史了',
        icon: 'none',
      });
      return;
    }

    try {
      const response = await fetchConversationHistory({
        conversationId: this.data.conversationId,
        anchorMessageId: this.data.messages.length ? this.data.messages[0].id : '',
      });
      const mergedMessages = (response.messages || []).concat(this.data.messages);
      this.setData({
        messages: mergedMessages,
        hasMoreHistory: !!response.hasMoreHistory,
      });
    } catch (error) {
      wx.showToast({
        title: '历史消息加载失败',
        icon: 'none',
      });
    }
  },

  copyMessage(event) {
    const content = event.currentTarget.dataset.content;
    if (!content) {
      return;
    }
    wx.setClipboardData({
      data: content,
    });
  },

  async sendMessage() {
    const content = this.data.draft.trim();
    if (!content || this.data.sending) {
      return;
    }

    const baseId = this.data.nextMessageId;
    const userMessage = this.createMessage(baseId, 'user', content);
    const loadingMessage = this.createMessage(baseId + 1, 'assistant', '...', true);
    const nextMessages = this.data.messages.concat(userMessage, loadingMessage);

    this.setData({
      draft: '',
      sending: true,
      assistantStatus: '正在思考',
      messages: nextMessages,
      nextMessageId: baseId + 2,
    });

    this.scrollToBottom();

    try {
      const response = await sendConversationMessage({
        conversationId: this.data.conversationId,
        content,
        sceneCode: 'emotion_support_chat',
      });
      const replyMessage = response.replyMessage || this.createMessage(loadingMessage.id, 'assistant', '小元已收到你的消息。');
      const finalizedMessages = this.data.messages.map((item) => {
        if (item.id === loadingMessage.id) {
          return {
            id: replyMessage.id || item.id,
            role: 'assistant',
            content: replyMessage.content,
            time: replyMessage.time || this.getTimeLabel(),
            loading: false,
          };
        }
        return item;
      });

      this.setData({
        messages: finalizedMessages,
        sending: false,
        assistantStatus: response.assistantStatus || '在线陪伴中',
        conversationId: response.conversationId || this.data.conversationId,
      });

      this.scrollToBottom();
    } catch (error) {
      const finalizedMessages = this.data.messages.map((item) => {
        if (item.id === loadingMessage.id) {
          return {
            id: item.id,
            role: 'assistant',
            content: '消息发送失败，请稍后重试。',
            time: this.getTimeLabel(),
            loading: false,
          };
        }
        return item;
      });
      this.setData({
        messages: finalizedMessages,
        sending: false,
        assistantStatus: '在线陪伴中',
      });
    }
  },

  createMessage(id, role, content, loading = false) {
    return {
      id,
      role,
      content,
      time: this.getTimeLabel(),
      loading,
    };
  },

  getTimeLabel() {
    const date = new Date();
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  scrollToBottom() {
    const messages = this.data.messages;
    if (!messages.length) {
      return;
    }
    const lastMessage = messages[messages.length - 1];
    setTimeout(() => {
      this.setData({
        scrollIntoView: `msg-${lastMessage.id}`,
      });
    }, 60);
  },

  getNextMessageId(messages) {
    if (!messages.length) {
      return 1;
    }
    return Math.max.apply(
      null,
      messages.map((item) => item.id)
    ) + 1;
  },

  clearReplyTimer() {
    if (this.replyTimer) {
      clearTimeout(this.replyTimer);
      this.replyTimer = null;
    }
  },
});
