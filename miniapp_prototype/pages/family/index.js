const state = require('../../utils/state');

Page({
  data: {
    familyMessage: '',
    latestPain: 0,
    latestAlert: null,
    noRecordDays: 0,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const summary = state.getFamilySummary();
    this.setData({
      familyMessage: summary.familyMessage,
      latestPain: summary.latestPain,
      latestAlert: summary.latestAlert,
      noRecordDays: summary.noRecordDays,
    });
  },
});
