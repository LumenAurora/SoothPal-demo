const state = require('../../utils/state');

const PROFILE_KEY = 'soothpal_profile_name';
const emergencyPattern = /突发|剧痛|电击|发作|麻木|无力|走不了|睡不着|8分|9分|急性|刺痛/;

function inferScenario(text) {
  if (emergencyPattern.test(text)) {
    return 'critical';
  }

  if (/加重|放射|发麻|影响走路|持续|反复/.test(text)) {
    return 'rising';
  }

  return 'stable';
}

Page({
  data: {
    painInput: '',
    nameInput: '',
    profileName: '',
    canAskName: false,
    showAssessment: false,
    side: 'back',
    visibleRegions: [],
    selectedLabels: [],
    intensity: 0,
  },

  onLoad() {
    const profileName = wx.getStorageSync(PROFILE_KEY) || '';
    this.setData({ profileName });
  },

  onShow() {
    this.refreshCapture();
  },

  refreshCapture() {
    const runtime = state.getRuntime();
    this.setData({
      side: runtime.side,
      visibleRegions: state.getVisibleRegions(),
      selectedLabels: state.getSelectedRegionLabels(),
      intensity: runtime.intensity,
    });
  },

  onPainInput(event) {
    this.setData({
      painInput: event.detail.value,
    });
  },

  onNameInput(event) {
    this.setData({
      nameInput: event.detail.value,
    });
  },

  onSubmitPain() {
    const text = (this.data.painInput || '').trim();
    if (!text) {
      wx.showToast({
        title: '请先描述疼痛情况',
        icon: 'none',
      });
      return;
    }

    const scenarioId = inferScenario(text);
    state.loadScenario(scenarioId);
    state.setTranscript(text);
    state.parseTranscript();

    const needAssessment = emergencyPattern.test(text);
    this.setData({
      showAssessment: needAssessment,
      canAskName: !needAssessment,
    });

    this.refreshCapture();
  },

  onSwitchSide(event) {
    state.setSide(event.currentTarget.dataset.side);
    this.refreshCapture();
  },

  onTapRegion(event) {
    state.activateRegion(event.currentTarget.dataset.id);
    this.refreshCapture();
  },

  onIntensityChange(event) {
    state.setIntensity(event.detail.value);
    this.refreshCapture();
  },

  onFinishAssessment() {
    if (!this.data.selectedLabels.length) {
      wx.showToast({
        title: '请至少选择一个区域',
        icon: 'none',
      });
      return;
    }

    state.saveRecord();
    this.setData({
      showAssessment: false,
      canAskName: true,
    });

    this.refreshCapture();
  },

  onCreateProfile() {
    const name = (this.data.nameInput || '').trim();
    if (!name) {
      wx.showToast({
        title: '请输入称呼',
        icon: 'none',
      });
      return;
    }

    wx.setStorageSync(PROFILE_KEY, name);
    this.setData({ profileName: name });
    wx.switchTab({ url: '/pages/content/index' });
  },

  onEnterApp() {
    wx.switchTab({ url: '/pages/content/index' });
  },
});
