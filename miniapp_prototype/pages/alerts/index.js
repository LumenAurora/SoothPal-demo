const state = require('../../utils/state');

Page({
  data: {
    alerts: [],
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const alerts = state.getAlerts().map((item) => {
      let tone = 'alert-low';
      if (item.level === 1) {
        tone = 'alert-high';
      } else if (item.level === 2) {
        tone = 'alert-medium';
      }

      return Object.assign({}, item, { tone });
    });

    this.setData({ alerts });
  },

  onSimulateNoRecord() {
    state.simulateNoRecordAlert();
    this.refresh();
    wx.showToast({
      title: '已模拟失访提醒',
      icon: 'none',
      duration: 1200,
    });
  },
});
