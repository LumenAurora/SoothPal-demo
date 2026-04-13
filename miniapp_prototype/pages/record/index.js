const state = require('../../utils/state');

Page({
  data: {
    side: 'back',
    intensity: 0,
    visibleRegions: [],
    selectedLabels: [],
    quality: {
      label: '未采集',
      hint: '请选择区域',
      score: 0,
      level: 'none',
    },
    activeRegion: null,
    activeFineOptions: [],
    transcript: '',
    extraction: [],
    lastSavedAt: '--:--',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const runtime = state.getRuntime();
    const activeRegion = state.getActiveRegion();
    const activeFineOptions = activeRegion
      ? activeRegion.fine.map((label) => ({
          label,
          selected: activeRegion.selectedFine.indexOf(label) > -1,
        }))
      : [];

    this.setData({
      side: runtime.side,
      intensity: runtime.intensity,
      visibleRegions: state.getVisibleRegions(),
      selectedLabels: state.getSelectedRegionLabels(),
      quality: state.getQualityInfo(),
      activeRegion,
      activeFineOptions,
      transcript: runtime.transcript,
      extraction: runtime.extraction,
      lastSavedAt: runtime.lastSavedAt || '--:--',
    });
  },

  onSwitchSide(event) {
    state.setSide(event.currentTarget.dataset.side);
    this.refresh();
  },

  onTapRegion(event) {
    state.activateRegion(event.currentTarget.dataset.id);
    this.refresh();
  },

  onTapFine(event) {
    const regionId = event.currentTarget.dataset.region;
    const fineLabel = event.currentTarget.dataset.label;
    state.toggleFineRegion(regionId, fineLabel);
    this.refresh();
  },

  onRemoveRegion(event) {
    state.removeRegion(event.currentTarget.dataset.id);
    this.refresh();
  },

  onIntensityChange(event) {
    state.setIntensity(event.detail.value);
    this.refresh();
  },

  onTranscriptInput(event) {
    state.setTranscript(event.detail.value);
    this.setData({
      transcript: event.detail.value,
    });
  },

  onParseTranscript() {
    const extraction = state.parseTranscript();
    this.setData({ extraction });
    wx.showToast({
      title: '已完成结构化',
      icon: 'success',
      duration: 1200,
    });
  },

  onSaveRecord() {
    const result = state.saveRecord();
    if (!result.ok) {
      wx.showToast({
        title: result.message,
        icon: 'none',
      });
      return;
    }

    this.refresh();

    const tip = `${result.riskLabel} 已评估`;
    wx.showToast({
      title: tip,
      icon: 'none',
      duration: 1400,
    });

    if (result.riskLevel === 1 || result.riskLevel === 2) {
      wx.switchTab({
        url: '/pages/alerts/index',
      });
    }
  },

  goDashboard() {
    wx.navigateTo({
      url: '/pages/dashboard/index',
    });
  },
});
