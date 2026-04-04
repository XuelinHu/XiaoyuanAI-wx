const olderMessages = [
  {
    id: 1,
    role: 'assistant',
    content: '你好，我是小元。这里可以先放心把情绪说出来，我会先陪你理清当下的感受。',
    time: '20:30',
  },
  {
    id: 2,
    role: 'user',
    content: '这几天总觉得胸口发闷，也有点怕把情绪影响到家里人。',
    time: '20:31',
  },
  {
    id: 3,
    role: 'assistant',
    content: '能感觉到你一直在撑着自己，也在顾及家人。先不用急着把自己表现得很坚强，我们可以一步一步来。',
    time: '20:31',
  },
];

const starterMessages = [
  {
    id: 4,
    role: 'assistant',
    content: '如果你愿意，可以从“现在最难受的一个感觉”开始说。',
    time: '20:32',
  },
];

Page({
  data: {
    assistantStatus: '在线陪伴中',
    messages: starterMessages,
    draft: '',
    scrollIntoView: '',
    sending: false,
    keyboardHeight: 108,
    scrollExtraHeight: 0,
    hasMoreHistory: true,
    nextMessageId: 5,
  },

  onLoad() {
    this.setupKeyboardListener();
    this.scrollToBottom();
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

  showAssistantIntro() {
    wx.showModal({
      title: '关于小元',
      content: '小元是一个癌症情绪支持聊天助手，当前页面使用 mock 数据演示对话、历史加载和输入交互，适合后续接入真实接口。',
      showCancel: false,
      confirmText: '知道了',
    });
  },

  loadOlderMessages() {
    if (!this.data.hasMoreHistory) {
      wx.showToast({
        title: '没有更多历史了',
        icon: 'none',
      });
      return;
    }

    const mergedMessages = olderMessages.concat(this.data.messages);
    this.setData({
      messages: mergedMessages,
      hasMoreHistory: false,
    });
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

  sendMessage() {
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

    this.replyTimer = setTimeout(() => {
      const reply = this.getMockReply(content);
      const finalizedMessages = this.data.messages.map((item) => {
        if (item.id === loadingMessage.id) {
          return {
            id: item.id,
            role: 'assistant',
            content: reply,
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

      this.scrollToBottom();
    }, 1200);
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

  getMockReply(content) {
    if (content.includes('害怕') || content.includes('担心')) {
      return '害怕是很真实的反应，不代表你不够勇敢。现在先别要求自己马上平静下来，我们可以先一起把最担心的那件事说清楚。';
    }

    if (content.includes('睡') || content.includes('失眠')) {
      return '睡不着的时候，情绪常常会被放大。今晚可以只给自己一个很小的目标，比如先慢慢呼吸三次，再把脑子里最吵的那个念头写出来。';
    }

    if (content.includes('家人') || content.includes('爸爸') || content.includes('妈妈')) {
      return '你在意家人的感受，也说明你一直在努力保护这段关系。很多时候，把“我现在有点难受，但不需要你立刻解决”先说出来，反而会让沟通轻一点。';
    }

    return '我看到你已经把感受说出来了，这一步很重要。你不用急着整理得很完整，我们可以继续只聊当下最压着你的那个点。';
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

  clearReplyTimer() {
    if (this.replyTimer) {
      clearTimeout(this.replyTimer);
      this.replyTimer = null;
    }
  },
});
