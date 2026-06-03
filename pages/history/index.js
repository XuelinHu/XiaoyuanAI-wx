const { fetchSessionList } = require('../../services/history');

Page({
  data: {
    sessions: [],
  },

  onLoad() {
    this.loadSessions();
  },

  async loadSessions() {
    try {
      const response = await fetchSessionList();
      this.setData({
        sessions: response.sessions || [],
      });
    } catch (error) {
      wx.showToast({
        title: '历史会话加载失败',
        icon: 'none',
      });
    }
  },
});
