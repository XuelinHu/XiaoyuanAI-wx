Component({
  properties: {
    current: {
      type: String,
      value: 'chat',
    },
  },

  data: {
    tabs: [
      { key: 'history', label: '历史', icon: 'H', url: '/pages/history/index' },
      { key: 'chat', label: '会话', icon: 'AI', url: '/pages/chat/index' },
      { key: 'profile', label: '我的', icon: 'ME', url: '/pages/profile/index' },
    ],
  },

  methods: {
    handleTap(event) {
      const { key, url } = event.currentTarget.dataset;
      if (!url || key === this.properties.current) {
        return;
      }
      wx.redirectTo({ url });
    },
  },
});
