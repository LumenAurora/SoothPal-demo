const state = require('../../utils/state');
const rag = require('../../utils/rag');

const PROFILE_KEY = 'soothpal_profile_name';

Page({
  data: {
    profileName: '您',
    latestPain: 0,
    latestAlertLabel: 'L0 绿色',
    latestAlertReason: '状态稳定',
    lastSavedAt: '--:--',
    weekly: [],
    medication: '未提及',
    sleep: '未提及',
    advice: '请持续记录，观察趋势变化。',
    askQuery: '',
    askResult: null,
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const profileName = wx.getStorageSync(PROFILE_KEY) || '您';
    const runtime = state.getRuntime();
    const summary = state.getFamilySummary();
    const dashboard = state.getDashboardData();
    const extraction = runtime.extraction || [];

    const medication = extraction.find((item) => item.key === 'medication');
    const sleep = extraction.find((item) => item.key === 'sleep');

    const weekly = (dashboard.weekly || []).map((item) => ({
      day: item.day,
      pain: item.pain,
      height: 28 + Number(item.pain) * 12,
    }));

    this.setData({
      profileName,
      latestPain: summary.latestPain,
      latestAlertLabel: summary.latestAlert ? summary.latestAlert.levelLabel : 'L0 绿色',
      latestAlertReason: summary.latestAlert ? summary.latestAlert.reason : '状态稳定',
      lastSavedAt: runtime.lastSavedAt || '--:--',
      weekly,
      medication: medication ? medication.value : '未提及',
      sleep: sleep ? sleep.value : '未提及',
      advice: dashboard.reportBullets && dashboard.reportBullets.length
        ? dashboard.reportBullets[0]
        : '请持续记录，观察趋势变化。',
    });
  },

  onAskInput(event) {
    this.setData({
      askQuery: event.detail.value,
    });
  },

  onAskSubmit() {
    const query = (this.data.askQuery || '').trim();
    if (!query) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none',
      });
      return;
    }

    const result = rag.askWithRag(query);
    this.setData({
      askResult: {
        answer: result.answer,
        isHighRisk: result.isHighRisk,
        citations: result.citations || [],
      },
    });
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
