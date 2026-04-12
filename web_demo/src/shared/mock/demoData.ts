export type RiskLevel = 'low' | 'medium' | 'high';
export type BodySide = 'front' | 'back';
export type PainRegionId = string;

export interface FineRegion {
  id: string;
  label: string;
}

export interface PainRegion {
  id: PainRegionId;
  label: string;
  side: BodySide;
  x: number;
  y: number;
  fineRegions: FineRegion[];
}

export interface ExtractionField {
  key: string;
  label: string;
  value: string;
}

export interface WeeklyPoint {
  day: string;
  pain: number;
  steps: number;
}

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  transcript: string;
  selectedRegions: PainRegionId[];
  selectedFineRegions: Record<PainRegionId, string[]>;
  intensity: number;
  extraction: ExtractionField[];
  riskLevel: RiskLevel;
  riskRuleId: string;
  riskReason: string;
  agentReply: string;
  citation: string;
  redactionQuery: string;
  weekly: WeeklyPoint[];
  reportBullets: string[];
  familyMessage: string;
}

export const painRegions: PainRegion[] = [
  {
    id: 'front_head',
    label: '头部',
    side: 'front',
    x: 50,
    y: 16,
    fineRegions: [
      { id: 'front_head_forehead', label: '前额' },
      { id: 'front_head_temporal', label: '颞侧' },
      { id: 'front_head_occipital_ref', label: '枕部牵涉' },
    ],
  },
  {
    id: 'front_neck',
    label: '颈前',
    side: 'front',
    x: 50,
    y: 24,
    fineRegions: [
      { id: 'front_neck_mid', label: '颈前正中' },
      { id: 'front_neck_left', label: '左颈前侧' },
      { id: 'front_neck_right', label: '右颈前侧' },
    ],
  },
  {
    id: 'front_shoulder_left',
    label: '左肩',
    side: 'front',
    x: 36,
    y: 30,
    fineRegions: [
      { id: 'front_shoulder_left_anterior', label: '肩前束' },
      { id: 'front_shoulder_left_lateral', label: '三角肌外侧' },
      { id: 'front_shoulder_left_joint', label: '肩关节周围' },
    ],
  },
  {
    id: 'front_shoulder_right',
    label: '右肩',
    side: 'front',
    x: 64,
    y: 30,
    fineRegions: [
      { id: 'front_shoulder_right_anterior', label: '肩前束' },
      { id: 'front_shoulder_right_lateral', label: '三角肌外侧' },
      { id: 'front_shoulder_right_joint', label: '肩关节周围' },
    ],
  },
  {
    id: 'front_chest_left',
    label: '左胸',
    side: 'front',
    x: 42,
    y: 38,
    fineRegions: [
      { id: 'front_chest_left_upper', label: '上胸' },
      { id: 'front_chest_left_lower', label: '下胸' },
    ],
  },
  {
    id: 'front_chest_right',
    label: '右胸',
    side: 'front',
    x: 58,
    y: 38,
    fineRegions: [
      { id: 'front_chest_right_upper', label: '上胸' },
      { id: 'front_chest_right_lower', label: '下胸' },
    ],
  },
  {
    id: 'front_abdomen_upper',
    label: '上腹',
    side: 'front',
    x: 50,
    y: 47,
    fineRegions: [
      { id: 'front_abdomen_upper_mid', label: '胃脘区' },
      { id: 'front_abdomen_upper_left', label: '左上腹' },
      { id: 'front_abdomen_upper_right', label: '右上腹' },
    ],
  },
  {
    id: 'front_abdomen_lower',
    label: '下腹',
    side: 'front',
    x: 50,
    y: 56,
    fineRegions: [
      { id: 'front_abdomen_lower_mid', label: '下腹正中' },
      { id: 'front_abdomen_lower_left', label: '左下腹' },
      { id: 'front_abdomen_lower_right', label: '右下腹' },
    ],
  },
  {
    id: 'front_hip_left',
    label: '左髋',
    side: 'front',
    x: 42,
    y: 64,
    fineRegions: [
      { id: 'front_hip_left_joint', label: '髋关节前侧' },
      { id: 'front_hip_left_groin', label: '腹股沟区' },
    ],
  },
  {
    id: 'front_hip_right',
    label: '右髋',
    side: 'front',
    x: 58,
    y: 64,
    fineRegions: [
      { id: 'front_hip_right_joint', label: '髋关节前侧' },
      { id: 'front_hip_right_groin', label: '腹股沟区' },
    ],
  },
  {
    id: 'front_knee_left',
    label: '左膝',
    side: 'front',
    x: 43,
    y: 84,
    fineRegions: [
      { id: 'front_knee_left_patella', label: '髌骨周围' },
      { id: 'front_knee_left_medial', label: '内侧间隙' },
      { id: 'front_knee_left_lateral', label: '外侧间隙' },
    ],
  },
  {
    id: 'front_knee_right',
    label: '右膝',
    side: 'front',
    x: 57,
    y: 84,
    fineRegions: [
      { id: 'front_knee_right_patella', label: '髌骨周围' },
      { id: 'front_knee_right_medial', label: '内侧间隙' },
      { id: 'front_knee_right_lateral', label: '外侧间隙' },
    ],
  },
  {
    id: 'back_neck',
    label: '颈后',
    side: 'back',
    x: 50,
    y: 22,
    fineRegions: [
      { id: 'back_neck_mid', label: '后颈正中' },
      { id: 'back_neck_left', label: '左斜方肌上束' },
      { id: 'back_neck_right', label: '右斜方肌上束' },
    ],
  },
  {
    id: 'back_shoulder_left',
    label: '左肩背',
    side: 'back',
    x: 37,
    y: 30,
    fineRegions: [
      { id: 'back_shoulder_left_scapula', label: '肩胛上角' },
      { id: 'back_shoulder_left_posterior', label: '肩后束' },
    ],
  },
  {
    id: 'back_shoulder_right',
    label: '右肩背',
    side: 'back',
    x: 63,
    y: 30,
    fineRegions: [
      { id: 'back_shoulder_right_scapula', label: '肩胛上角' },
      { id: 'back_shoulder_right_posterior', label: '肩后束' },
    ],
  },
  {
    id: 'back_upper',
    label: '上背',
    side: 'back',
    x: 50,
    y: 40,
    fineRegions: [
      { id: 'back_upper_mid', label: '胸椎中线' },
      { id: 'back_upper_left', label: '左胸背肌群' },
      { id: 'back_upper_right', label: '右胸背肌群' },
    ],
  },
  {
    id: 'back_lumbar',
    label: '腰背',
    side: 'back',
    x: 50,
    y: 54,
    fineRegions: [
      { id: 'back_lumbar_l34', label: 'L3-L4' },
      { id: 'back_lumbar_l45', label: 'L4-L5' },
      { id: 'back_lumbar_s1', label: 'L5-S1' },
    ],
  },
  {
    id: 'back_glute_left',
    label: '左臀',
    side: 'back',
    x: 43,
    y: 64,
    fineRegions: [
      { id: 'back_glute_left_upper', label: '臀上外侧' },
      { id: 'back_glute_left_sacro', label: '骶髂关节区' },
    ],
  },
  {
    id: 'back_glute_right',
    label: '右臀',
    side: 'back',
    x: 57,
    y: 64,
    fineRegions: [
      { id: 'back_glute_right_upper', label: '臀上外侧' },
      { id: 'back_glute_right_sacro', label: '骶髂关节区' },
    ],
  },
  {
    id: 'back_calf_left',
    label: '左下肢',
    side: 'back',
    x: 43,
    y: 82,
    fineRegions: [
      { id: 'back_calf_left_ham', label: '腘绳肌区' },
      { id: 'back_calf_left_gastro', label: '腓肠肌区' },
      { id: 'back_calf_left_achilles', label: '跟腱区' },
    ],
  },
  {
    id: 'back_calf_right',
    label: '右下肢',
    side: 'back',
    x: 57,
    y: 82,
    fineRegions: [
      { id: 'back_calf_right_ham', label: '腘绳肌区' },
      { id: 'back_calf_right_gastro', label: '腓肠肌区' },
      { id: 'back_calf_right_achilles', label: '跟腱区' },
    ],
  },
];

export const scenarios: DemoScenario[] = [
  {
    id: 'stable',
    title: '稳定期追踪',
    subtitle: '低风险、持续打卡、可见改善',
    transcript:
      '今天右侧腰部有一点酸，走路影响不大，大概 3 分，做了拉伸后明显缓解。',
    selectedRegions: ['back_lumbar', 'back_glute_right'],
    selectedFineRegions: {
      back_lumbar: ['back_lumbar_l45'],
      back_glute_right: ['back_glute_right_upper'],
    },
    intensity: 3,
    extraction: [
      { key: 'location', label: '部位', value: '右侧腰背 + 右髋' },
      { key: 'radiation', label: '放射', value: '无明显放射' },
      { key: 'intensity', label: '强度', value: '3 / 10（轻度）' },
      { key: 'trigger', label: '诱因', value: '久坐后不适' },
      { key: 'relief', label: '缓解', value: '拉伸后缓解' },
    ],
    riskLevel: 'low',
    riskRuleId: 'rule_followup_missing_l0',
    riskReason: '症状稳定，无突增，建议保持当前康复计划。',
    agentReply:
      '我看到你这周腰背记录以轻度为主，且步数在稳步回升。建议继续晚间热敷 15 分钟，再做 2 组温和拉伸。',
    citation: '2024 慢性疼痛管理指南 · chunk_07',
    redactionQuery: '王阿姨 13800138000 说右腰偶发酸痛，是否继续热敷？',
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
      '疼痛强度较上周下降 22%，趋势整体平稳。',
      '步数提升与疼痛降低呈正相关，可继续低强度步行训练。',
      '建议保持晚间拉伸 8 分钟，连续 7 天后复评。',
    ],
    familyMessage: '亲情号提醒：本周风险等级为绿色，状态稳定，请继续鼓励每日打卡。',
  },
  {
    id: 'rising',
    title: '波动期预警',
    subtitle: '中风险、疼痛上升、需要干预',
    transcript:
      '今天右侧腰到腿外侧有点发麻，走路会加重，6 分左右，吃了止痛药后只好一点。',
    selectedRegions: ['back_lumbar', 'back_calf_right'],
    selectedFineRegions: {
      back_lumbar: ['back_lumbar_l45', 'back_lumbar_s1'],
      back_calf_right: ['back_calf_right_gastro'],
    },
    intensity: 6,
    extraction: [
      { key: 'location', label: '部位', value: '右侧腰背 -> 右下肢外侧' },
      { key: 'radiation', label: '放射', value: '存在下行放射' },
      { key: 'intensity', label: '强度', value: '6 / 10（中度）' },
      { key: 'trigger', label: '诱因', value: '行走加重' },
      { key: 'relief', label: '缓解', value: '口服止痛药后部分缓解' },
    ],
    riskLevel: 'medium',
    riskRuleId: 'rule_nrs_rise_l2',
    riskReason: '当日评分较 7 日均值上升 2.8 分，且出现放射性症状。',
    agentReply:
      '你本周第 3 次记录到“腰背向右下肢放射”。先避免久站和负重，今天建议做低强度神经滑动训练。如症状继续上升，请尽快复评。',
    citation: '2024 慢性疼痛管理指南 · chunk_12',
    redactionQuery: '李先生在北京某医院复查后仍腰腿痛 6 分，是否需要调整康复动作？',
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
      '近 7 天疼痛均值较前周上升 1.6 分，已进入橙色关注区。',
      '活动量连续下降，建议减少久站和负重动作。',
      '建议 24-48 小时内完成专科复评，必要时联系医生。',
    ],
    familyMessage: '亲情号提醒：检测到中风险波动，请关注家人近期行走受限情况。',
  },
  {
    id: 'critical',
    title: '高危红色预警',
    subtitle: '高风险、突增触发、建议立即就医',
    transcript:
      '今天腰和右腿突然很痛，像电击一样，8 到 9 分，晚上几乎走不了路。',
    selectedRegions: ['back_lumbar', 'back_glute_right', 'back_calf_right'],
    selectedFineRegions: {
      back_lumbar: ['back_lumbar_l45', 'back_lumbar_s1'],
      back_glute_right: ['back_glute_right_sacro'],
      back_calf_right: ['back_calf_right_ham', 'back_calf_right_gastro'],
    },
    intensity: 9,
    extraction: [
      { key: 'location', label: '部位', value: '腰背 + 右髋 + 右下肢' },
      { key: 'radiation', label: '放射', value: '明显下肢放射痛' },
      { key: 'intensity', label: '强度', value: '9 / 10（重度）' },
      { key: 'trigger', label: '诱因', value: '突发，无明显缓解' },
      { key: 'relief', label: '缓解', value: '常规处理无效' },
    ],
    riskLevel: 'high',
    riskRuleId: 'rule_nrs_ge8_l1',
    riskReason: '当前强度 >= 8 且较基线突增 > 3，触发一级红色预警。',
    agentReply:
      '已触发红色预警。你描述了突发剧痛并伴随活动受限，请立即线下就医评估，优先排查神经受压与急性炎症风险。',
    citation: '红旗征象速查 · chunk_03',
    redactionQuery: '张女士在协和附近突发右腿电击样疼痛 9 分，今晚是否可继续自行观察？',
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
      '疼痛强度连续 3 天快速上升，已超过高危阈值。',
      '活动能力显著下降，出现急性功能受限信号。',
      '建议立即线下就医评估，优先排查神经压迫相关风险。',
    ],
    familyMessage: '亲情号紧急通知：系统触发红色预警，请尽快联系并陪同就医。',
  },
];

export const defaultScenarioId = scenarios[1].id;

export const redactQuery = (input: string) =>
  input
    .replace(/1\d{10}/g, '[REDACTED_PHONE]')
    .replace(/王阿姨|李先生|张女士|赵先生|陈女士|刘先生/g, '[REDACTED_NAME]')
    .replace(/北京某医院|协和附近|某医院/g, '[REDACTED_LOCATION]');
