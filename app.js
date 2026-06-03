App({
  globalData: {
    appName: '小元',
    backendReady: false,
  },

  onLaunch() {
    this.globalData.backendReady = true;
  },
});
