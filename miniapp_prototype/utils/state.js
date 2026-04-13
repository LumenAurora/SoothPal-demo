const speech = require('./speech');

const scenarios = {
  stable: {
    id: 'stable',
    title: '稳定期追踪',
    subtitle: '低风险、持续打卡、可见改善',
    transcript: '今天右侧腰部有一点酸，走路影响不大，大概3分，做了拉伸后明显缓解。',
    selectedRegions: ['back_lumbar', 'back_glute_right'],
    selectedFineRegions: {
      back_lumbar: ['back_lumbar_l45'],
      back_glute_right: ['back_glute_right_upper'],
    },
    intensity: 3,
    stage: 'rehab',
    seedRiskLevel: 0,
    seedReasons: ['症状稳定，建议保持当前康复节奏。'],
    weekly: [
      { day: '周一', pain: 4, steps: 3900 },
      { day: '周二', pain: 4, steps: 4200 },
      { day: '周三', pain: 3, steps: 4600 },
      { day: '周四', pain: 3, steps: 5100 },
      { day: '周五', pain: 3, steps: 5400 },
      { day: '周六', pain: 2, steps: 6200 },
      { day: '周日', pain: 3, steps: 5800 },
    ],
    reportBullets: [
      '疼痛强度较上周下降，趋势整体平稳。',
      '步数提升与疼痛降低呈正相关。',
      '建议保持晚间拉伸 8 分钟，连续 7 天后复评。',
    ],
    familyMessage: '亲情号提醒：本周风险等级为绿色，状态稳定，请继续鼓励每日打卡。',
  },
  rising: {
    id: 'rising',
    title: '波动期预警',
    subtitle: '中风险、疼痛上升、需要干预',
    transcript: '今天右侧腰到腿外侧有点发麻，走路会加重，6分左右，吃了止痛药后只好一点。',
    selectedRegions: ['back_lumbar', 'back_calf_right'],
    selectedFineRegions: {
      back_lumbar: ['back_lumbar_l45', 'back_lumbar_s1'],
      back_calf_right: ['back_calf_right_gastro'],
    },
    intensity: 6,
    stage: 'rehab',
    seedRiskLevel: 2,
    seedReasons: ['当日评分较7日均值上升，且存在放射性症状。'],
    weekly: [
      { day: '周一', pain: 4, steps: 4500 },
      { day: '周二', pain: 4, steps: 4700 },
      { day: '周三', pain: 5, steps: 4200 },
      { day: '周四', pain: 5, steps: 3900 },
      { day: '周五', pain: 6, steps: 3200 },
      { day: '周六', pain: 6, steps: 3100 },
      { day: '周日', pain: 6, steps: 2800 },
    ],
    reportBullets: [
      '近7天疼痛均值持续上升，进入橙色关注区。',
      '活动量连续下降，建议减少久站和负重。',
      '建议24-48小时内完成专科复评。',
    ],
    familyMessage: '亲情号提醒：检测到中风险波动，请关注家人近期行走受限情况。',
  },
  critical: {
    id: 'critical',
    title: '高危红色预警',
    subtitle: '高风险、突增触发、建议立即就医',
    transcript: '今天腰和右腿突然很痛，像电击一样，8到9分，晚上几乎走不了路。',
    selectedRegions: ['back_lumbar', 'back_glute_right', 'back_calf_right'],
    selectedFineRegions: {
      back_lumbar: ['back_lumbar_l45', 'back_lumbar_s1'],
      back_glute_right: ['back_glute_right_sacro'],
      back_calf_right: ['back_calf_right_ham', 'back_calf_right_gastro'],
    },
    intensity: 9,
    stage: 'postop_week1',
    seedRiskLevel: 1,
    seedReasons: ['当前强度>=8且较基线突增，触发一级红色预警。'],
    weekly: [
      { day: '周一', pain: 4, steps: 4400 },
      { day: '周二', pain: 4, steps: 4300 },
      { day: '周三', pain: 5, steps: 4100 },
      { day: '周四', pain: 5, steps: 3900 },
      { day: '周五', pain: 7, steps: 2600 },
      { day: '周六', pain: 8, steps: 1700 },
      { day: '周日', pain: 9, steps: 1100 },
    ],
    reportBullets: [
      '疼痛强度连续3天快速上升，已超过高危阈值。',
      '活动能力显著下降，出现急性功能受限信号。',
      '建议立即线下就医评估。',
    ],
    familyMessage: '亲情号紧急通知：系统触发红色预警，请尽快联系并陪同就医。',
  },
};

const regionLibrary = {
  front: [
    {
      id: 'front_head',
      label: '头部',
      shortLabel: '头部',
      x: 50,
      y: 16,
      w: 20,
      h: 9,
      fine: ['前额', '颞侧', '枕部牵涉'],
    },
    {
      id: 'front_neck',
      label: '颈前',
      shortLabel: '颈前',
      x: 50,
      y: 24,
      w: 18,
      h: 7,
      fine: ['颈前正中', '左颈前侧', '右颈前侧'],
    },
    {
      id: 'front_shoulder_left',
      label: '左肩',
      shortLabel: '左肩',
      x: 36,
      y: 31,
      w: 16,
      h: 8,
      fine: ['肩前束', '三角肌外侧', '肩关节周围'],
    },
    {
      id: 'front_shoulder_right',
      label: '右肩',
      shortLabel: '右肩',
      x: 64,
      y: 31,
      w: 16,
      h: 8,
      fine: ['肩前束', '三角肌外侧', '肩关节周围'],
    },
    {
      id: 'front_chest_left',
      label: '左胸',
      shortLabel: '左胸',
      x: 41,
      y: 39,
      w: 18,
      h: 9,
      fine: ['上胸', '下胸'],
    },
    {
      id: 'front_chest_right',
      label: '右胸',
      shortLabel: '右胸',
      x: 59,
      y: 39,
      w: 18,
      h: 9,
      fine: ['上胸', '下胸'],
    },
    {
      id: 'front_abdomen_upper',
      label: '上腹',
      shortLabel: '上腹',
      x: 50,
      y: 48,
      w: 24,
      h: 9,
      fine: ['胃脘区', '左上腹', '右上腹'],
    },
    {
      id: 'front_abdomen_lower',
      label: '下腹',
      shortLabel: '下腹',
      x: 50,
      y: 57,
      w: 24,
      h: 9,
      fine: ['下腹正中', '左下腹', '右下腹'],
    },
    {
      id: 'front_hip_left',
      label: '左髋',
      shortLabel: '左髋',
      x: 42,
      y: 65,
      w: 16,
      h: 9,
      fine: ['髋关节前侧', '腹股沟区'],
    },
    {
      id: 'front_hip_right',
      label: '右髋',
      shortLabel: '右髋',
      x: 58,
      y: 65,
      w: 16,
      h: 9,
      fine: ['髋关节前侧', '腹股沟区'],
    },
    {
      id: 'front_knee_left',
      label: '左膝',
      shortLabel: '左膝',
      x: 43,
      y: 84,
      w: 14,
      h: 9,
      fine: ['髌骨周围', '内侧间隙', '外侧间隙'],
    },
    {
      id: 'front_knee_right',
      label: '右膝',
      shortLabel: '右膝',
      x: 57,
      y: 84,
      w: 14,
      h: 9,
      fine: ['髌骨周围', '内侧间隙', '外侧间隙'],
    },
  ],
  back: [
    {
      id: 'back_neck',
      label: '颈后',
      shortLabel: '颈后',
      x: 50,
      y: 22,
      w: 20,
      h: 7,
      fine: ['后颈正中', '左斜方肌上束', '右斜方肌上束'],
    },
    {
      id: 'back_shoulder_left',
      label: '左肩背',
      shortLabel: '左肩背',
      x: 37,
      y: 30,
      w: 18,
      h: 8,
      fine: ['肩胛上角', '肩后束'],
    },
    {
      id: 'back_shoulder_right',
      label: '右肩背',
      shortLabel: '右肩背',
      x: 63,
      y: 30,
      w: 18,
      h: 8,
      fine: ['肩胛上角', '肩后束'],
    },
    {
      id: 'back_upper',
      label: '上背',
      shortLabel: '上背',
      x: 50,
      y: 41,
      w: 29,
      h: 11,
      fine: ['胸椎中线', '左胸背肌群', '右胸背肌群'],
    },
    {
      id: 'back_lumbar',
      label: '腰背',
      shortLabel: '腰背',
      x: 50,
      y: 54,
      w: 29,
      h: 11,
      fine: ['L3-L4', 'L4-L5', 'L5-S1'],
    },
    {
      id: 'back_glute_left',
      label: '左臀',
      shortLabel: '左臀',
      x: 43,
      y: 65,
      w: 16,
      h: 9,
      fine: ['臀上外侧', '骶髂关节区'],
    },
    {
      id: 'back_glute_right',
      label: '右臀',
      shortLabel: '右臀',
      x: 57,
      y: 65,
      w: 16,
      h: 9,
      fine: ['臀上外侧', '骶髂关节区'],
    },
    {
      id: 'back_calf_left',
      label: '左下肢',
      shortLabel: '左下肢',
      x: 43,
      y: 82,
      w: 15,
      h: 16,
      fine: ['腘绳肌区', '腓肠肌区', '跟腱区'],
    },
    {
      id: 'back_calf_right',
      label: '右下肢',
      shortLabel: '右下肢',
      x: 57,
      y: 82,
      w: 15,
      h: 16,
      fine: ['腘绳肌区', '腓肠肌区', '跟腱区'],
    },
  ],
};

const regionIndex = {};
Object.keys(regionLibrary).forEach((side) => {
  regionLibrary[side].forEach((region) => {
    regionIndex[region.id] = Object.assign({ side }, region);
  });
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getWeekdayLabel(date) {
  const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return map[date.getDay()];
}

function nowTimeLabel() {
  const date = new Date();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

function getRiskLabel(level) {
  if (level === 1) return 'L1 红色';
  if (level === 2) return 'L2 橙色';
  if (level === 3) return 'L3 黄色';
  return 'L0 绿色';
}

function createAlert(level, reasons, source) {
  return {
    id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    level,
    levelLabel: getRiskLabel(level),
    reasons: reasons.slice(),
    source,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
}

function createRuntime(scenarioId) {
  const scenario = scenarios[scenarioId] || scenarios.rising;
  const initialExtraction = speech.parseTranscriptToFields(scenario.transcript, []);

  const runtime = {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    scenarioSubtitle: scenario.subtitle,
    stage: scenario.stage,
    side: scenario.selectedRegions.length > 0 && regionIndex[scenario.selectedRegions[0]]
      ? regionIndex[scenario.selectedRegions[0]].side
      : 'back',
    activeRegionId: scenario.selectedRegions[0] || '',
    selectedRegions: scenario.selectedRegions.slice(),
    selectedFineRegions: clone(scenario.selectedFineRegions),
    intensity: scenario.intensity,
    transcript: scenario.transcript,
    extraction: initialExtraction,
    weekly: clone(scenario.weekly),
    reportBullets: scenario.reportBullets.slice(),
    familyMessage: scenario.familyMessage,
    alerts: [],
    records: scenario.weekly.map((item, index) => ({
      id: `history-${index}`,
      day: item.day,
      nrs: item.pain,
      steps: item.steps,
      regions: scenario.selectedRegions.slice(),
      createdAt: `历史记录-${index + 1}`,
      source: 'mock',
    })),
    noRecordDays: 0,
    lastSavedAt: '',
  };

  if (scenario.seedRiskLevel > 0) {
    runtime.alerts.push(createAlert(scenario.seedRiskLevel, scenario.seedReasons, '场景初始化'));
  }

  return runtime;
}

let runtimeState = createRuntime('rising');

function loadScenario(scenarioId) {
  runtimeState = createRuntime(scenarioId);
  return getRuntime();
}

function getRuntime() {
  return clone(runtimeState);
}

function setSide(side) {
  runtimeState.side = side;
  const active = regionIndex[runtimeState.activeRegionId];
  if (!active || active.side !== side) {
    const replacement = runtimeState.selectedRegions.find((regionId) => regionIndex[regionId] && regionIndex[regionId].side === side);
    runtimeState.activeRegionId = replacement || '';
  }
}

function setIntensity(value) {
  const numberValue = Number(value);
  const fixed = Number.isNaN(numberValue) ? 0 : numberValue;
  runtimeState.intensity = Math.max(0, Math.min(10, Math.round(fixed)));
}

function setTranscript(text) {
  runtimeState.transcript = text || '';
}

function parseTranscript() {
  runtimeState.extraction = speech.parseTranscriptToFields(runtimeState.transcript, runtimeState.extraction);
  return clone(runtimeState.extraction);
}

function activateRegion(regionId) {
  const region = regionIndex[regionId];
  if (!region) {
    return;
  }

  runtimeState.side = region.side;
  runtimeState.activeRegionId = regionId;
  if (runtimeState.selectedRegions.indexOf(regionId) === -1) {
    runtimeState.selectedRegions.push(regionId);
  }
}

function removeRegion(regionId) {
  runtimeState.selectedRegions = runtimeState.selectedRegions.filter((item) => item !== regionId);
  delete runtimeState.selectedFineRegions[regionId];
  if (runtimeState.activeRegionId === regionId) {
    runtimeState.activeRegionId = runtimeState.selectedRegions[0] || '';
  }
}

function toggleFineRegion(regionId, fineLabel) {
  const region = regionIndex[regionId];
  if (!region) {
    return;
  }

  if (runtimeState.selectedRegions.indexOf(regionId) === -1) {
    runtimeState.selectedRegions.push(regionId);
  }

  const current = runtimeState.selectedFineRegions[regionId] || [];
  const hasFine = current.indexOf(fineLabel) > -1;
  runtimeState.selectedFineRegions[regionId] = hasFine
    ? current.filter((item) => item !== fineLabel)
    : current.concat(fineLabel);
  runtimeState.activeRegionId = regionId;
}

function getVisibleRegions() {
  return regionLibrary[runtimeState.side].map((region) => {
    const fineCount = (runtimeState.selectedFineRegions[region.id] || []).length;
    return Object.assign({}, region, {
      selected: runtimeState.selectedRegions.indexOf(region.id) > -1,
      active: runtimeState.activeRegionId === region.id,
      fineCount,
    });
  });
}

function getActiveRegion() {
  if (!runtimeState.activeRegionId || !regionIndex[runtimeState.activeRegionId]) {
    return null;
  }

  const base = regionIndex[runtimeState.activeRegionId];
  return {
    id: base.id,
    label: base.label,
    side: base.side,
    fine: base.fine.slice(),
    selectedFine: (runtimeState.selectedFineRegions[base.id] || []).slice(),
  };
}

function getSelectedRegionLabels() {
  return runtimeState.selectedRegions
    .map((regionId) => {
      const region = regionIndex[regionId];
      if (!region) {
        return '';
      }
      const fineCount = (runtimeState.selectedFineRegions[regionId] || []).length;
      return fineCount > 0 ? `${region.label} · ${fineCount}个细分` : `${region.label} · 粗粒度`;
    })
    .filter(Boolean);
}

function getQualityInfo() {
  const selectedCount = runtimeState.selectedRegions.length;
  const fineCount = Object.keys(runtimeState.selectedFineRegions).reduce((acc, regionId) => {
    return acc + (runtimeState.selectedFineRegions[regionId] || []).length;
  }, 0);

  if (selectedCount === 0) {
    return {
      level: 'none',
      label: '未采集',
      hint: '请选择至少一个疼痛大区。',
      score: 0,
    };
  }

  const ratio = fineCount / selectedCount;
  const score = Math.min(100, Math.round(40 + ratio * 60));

  if (fineCount === 0) {
    return {
      level: 'low',
      label: '粗粒度记录',
      hint: '可用于基础趋势分析，但建议补充细分定位。',
      score,
    };
  }

  if (fineCount < selectedCount) {
    return {
      level: 'medium',
      label: '中等质量',
      hint: '建议补充关键区域细分，提高干预准确性。',
      score,
    };
  }

  return {
    level: 'high',
    label: '高质量记录',
    hint: '部位精细度充足，支持更可靠的模式识别。',
    score,
  };
}

function buildFamilyMessageByLevel(level, firstReason) {
  if (level === 1) {
    return `亲情号紧急通知：触发红色预警（${firstReason}），请尽快联系并陪同就医。`;
  }
  if (level === 2) {
    return `亲情号提醒：出现中风险波动（${firstReason}），建议24小时内复评。`;
  }
  if (level === 3) {
    return '亲情号提醒：已超过3天未记录，请提醒家人尽快完成随访。';
  }
  return '亲情号提醒：当前状态稳定，请继续鼓励每日打卡。';
}

function evaluateRisk(nrs) {
  const recentPains = runtimeState.records.slice(-7).map((record) => record.nrs);
  const avg = recentPains.length > 0
    ? recentPains.reduce((acc, value) => acc + value, 0) / recentPains.length
    : nrs;

  let level = 0;
  const reasons = [];

  if (nrs >= 8) {
    level = 1;
    reasons.push('NRS>=8');
  }

  const diff = Number((nrs - avg).toFixed(1));
  if (nrs >= 6 && diff >= 3) {
    level = 1;
    reasons.push(`较7日均值突增${diff}`);
  }

  const l2Threshold = runtimeState.stage === 'postop_week1' ? 4 : 5;
  const recentTwo = runtimeState.records.slice(-2);
  const continuousTrigger =
    nrs <= 7 &&
    nrs >= l2Threshold &&
    recentTwo.length === 2 &&
    recentTwo.every((item) => item.nrs >= l2Threshold);

  if (continuousTrigger && level === 0) {
    level = 2;
    reasons.push(`连续3次评分>=${l2Threshold}`);
  }

  if (runtimeState.noRecordDays >= 3 && level === 0) {
    level = 3;
    reasons.push('超过3天未记录');
  }

  if (!reasons.length) {
    reasons.push('未触发风险阈值');
  }

  return {
    level,
    reasons,
    avg: Number(avg.toFixed(1)),
  };
}

function saveRecord() {
  if (!runtimeState.selectedRegions.length) {
    return {
      ok: false,
      message: '请至少选择一个疼痛区域后再保存。',
    };
  }

  const today = new Date();
  const weekday = getWeekdayLabel(today);
  const stepsBase = runtimeState.weekly.length
    ? runtimeState.weekly[runtimeState.weekly.length - 1].steps
    : 4200;
  const newSteps = Math.max(800, Math.round(stepsBase - (runtimeState.intensity - 4) * 320));

  const risk = evaluateRisk(runtimeState.intensity);
  const record = {
    id: `record-${Date.now()}`,
    day: weekday,
    nrs: runtimeState.intensity,
    steps: newSteps,
    regions: runtimeState.selectedRegions.slice(),
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    source: 'manual',
  };

  runtimeState.records.push(record);
  runtimeState.weekly = runtimeState.weekly.concat([{ day: weekday, pain: runtimeState.intensity, steps: newSteps }]).slice(-7);
  runtimeState.lastSavedAt = nowTimeLabel();
  runtimeState.noRecordDays = 0;

  if (risk.level > 0) {
    runtimeState.alerts.push(createAlert(risk.level, risk.reasons, '保存记录触发'));
  }

  runtimeState.familyMessage = buildFamilyMessageByLevel(risk.level, risk.reasons[0]);

  return {
    ok: true,
    riskLevel: risk.level,
    riskLabel: getRiskLabel(risk.level),
    reasons: risk.reasons,
    weekly: clone(runtimeState.weekly),
  };
}

function simulateNoRecordAlert() {
  runtimeState.noRecordDays = 3;
  const alert = createAlert(3, ['超过3天未记录'], '模拟失访触发');
  runtimeState.alerts.push(alert);
  runtimeState.familyMessage = buildFamilyMessageByLevel(3, '超过3天未记录');
  return clone(alert);
}

function getAlerts() {
  return clone(runtimeState.alerts).reverse();
}

function getDashboardData() {
  const weekly = clone(runtimeState.weekly);
  const pains = weekly.map((item) => item.pain);
  const avgPain = pains.length ? (pains.reduce((acc, value) => acc + value, 0) / pains.length).toFixed(1) : '0.0';
  return {
    weekly,
    avgPain,
    reportBullets: runtimeState.reportBullets.slice(),
    scenarioTitle: runtimeState.scenarioTitle,
    scenarioSubtitle: runtimeState.scenarioSubtitle,
  };
}

function getFamilySummary() {
  const latestAlert = runtimeState.alerts.length ? runtimeState.alerts[runtimeState.alerts.length - 1] : null;
  const latestPain = runtimeState.weekly.length ? runtimeState.weekly[runtimeState.weekly.length - 1].pain : 0;

  return {
    familyMessage: runtimeState.familyMessage,
    latestPain,
    latestAlert: latestAlert
      ? {
          levelLabel: latestAlert.levelLabel,
          reason: latestAlert.reasons[0],
          time: latestAlert.createdAt,
        }
      : null,
    noRecordDays: runtimeState.noRecordDays,
  };
}

function getScenarioList() {
  return Object.keys(scenarios).map((key) => ({
    id: scenarios[key].id,
    title: scenarios[key].title,
    subtitle: scenarios[key].subtitle,
  }));
}

module.exports = {
  loadScenario,
  getRuntime,
  getScenarioList,
  setSide,
  setIntensity,
  setTranscript,
  parseTranscript,
  activateRegion,
  removeRegion,
  toggleFineRegion,
  getVisibleRegions,
  getActiveRegion,
  getSelectedRegionLabels,
  getQualityInfo,
  saveRecord,
  getAlerts,
  getDashboardData,
  getFamilySummary,
  simulateNoRecordAlert,
  getRiskLabel,
};
