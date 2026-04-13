const state = require('../../utils/state');

Page({
  data: {
    scenarioTitle: '',
    scenarioSubtitle: '',
    riskHint: '状态稳定',
    reportBullets: [],
    scenarios: [],
    feedCards: [
      {
        id: 'k1',
        tag: '今日推荐',
        title: '疼痛突然加重时，先做这3步',
        snippet: '先降低活动，再记录变化，再判断是否就医。',
      },
      {
        id: 'k2',
        tag: '康复动作',
        title: '久坐后腰背解压：30秒版',
        snippet: '起身、伸展、缓慢呼吸，重复2组。',
      },
      {
        id: 'k3',
        tag: '家属协同',
        title: '如何看懂风险等级变化',
        snippet: '连续升高比单次波动更值得关注。',
      },
      {
        id: 'k4',
        tag: '用药提醒',
        title: '何时需要尽快复评',
        snippet: '症状反复且影响睡眠时，建议尽快复评。',
      },
    ],
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const runtime = state.getRuntime();
    const dashboard = state.getDashboardData();
    const summary = state.getFamilySummary();

    this.setData({
      scenarioTitle: runtime.scenarioTitle,
      scenarioSubtitle: runtime.scenarioSubtitle,
      riskHint: summary.latestAlert ? summary.latestAlert.reason : '状态稳定',
      reportBullets: dashboard.reportBullets || [],
      scenarios: state.getScenarioList(),
    });
  },

  onLoadScenario(event) {
    const scenarioId = event.currentTarget.dataset.id;
    state.loadScenario(scenarioId);
    this.refresh();
  },

  goRecord() {
    wx.navigateTo({
      url: '/pages/record/index',
    });
  },

  goDashboard() {
    wx.navigateTo({
      url: '/pages/dashboard/index',
    });
  },
});
