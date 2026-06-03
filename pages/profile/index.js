const { fetchProfileCards } = require('../../services/profile');

Page({
  data: {
    items: [],
  },

  onLoad() {
    this.loadProfileCards();
  },

  async loadProfileCards() {
    try {
      const response = await fetchProfileCards();
      this.setData({
        items: response.items || [],
      });
    } catch (error) {
      wx.showToast({
        title: '个人资料加载失败',
        icon: 'none',
      });
    }
  },
});
