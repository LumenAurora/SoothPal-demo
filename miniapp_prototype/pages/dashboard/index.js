const state = require('../../utils/state');

Page({
  data: {
    scenarioTitle: '',
    scenarioSubtitle: '',
    avgPain: '0.0',
    weekly: [],
    reportBullets: [],
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const data = state.getDashboardData();
    const weekly = data.weekly.map((item) => ({
      day: item.day,
      pain: item.pain,
      steps: item.steps,
      painHeight: 26 + item.pain * 10,
      stepsHeight: 24 + Math.round(item.steps / 120),
    }));

    this.setData({
      scenarioTitle: data.scenarioTitle,
      scenarioSubtitle: data.scenarioSubtitle,
      avgPain: data.avgPain,
      weekly,
      reportBullets: data.reportBullets,
    });
  },
});
