function extractScore(text) {
  const matched = text.match(/(10|[0-9])\s*(分|\/10)?/);
  return matched ? Number(matched[1]) : null;
}

function pickValue(text, rules, fallback) {
  const hit = rules.find((rule) => rule.keywords.some((keyword) => text.indexOf(keyword) > -1));
  return hit ? hit.value : fallback;
}

function inferLocation(text, fallback) {
  const locationTable = [
    ['头', '头部'],
    ['颈', '颈部'],
    ['肩', '肩部'],
    ['胸', '胸部'],
    ['腹', '腹部'],
    ['腰', '腰背'],
    ['臀', '臀部'],
    ['膝', '膝部'],
    ['腿', '下肢'],
    ['脚', '足部'],
  ];

  const values = locationTable
    .filter((entry) => text.indexOf(entry[0]) > -1)
    .map((entry) => entry[1]);

  if (!values.length) {
    return fallback || '未识别，请手动补充';
  }

  return Array.from(new Set(values)).join(' + ');
}

function parseTranscriptToFields(transcript, fallbackFields) {
  const normalized = (transcript || '').replace(/\s+/g, '');
  const fallback = fallbackFields || [];
  const fallbackMap = {};
  fallback.forEach((item) => {
    fallbackMap[item.key] = item.value;
  });

  const score = extractScore(normalized);

  return [
    {
      key: 'location',
      label: '部位',
      value: inferLocation(normalized, fallbackMap.location),
    },
    {
      key: 'pain_score',
      label: '强度',
      value: score === null ? (fallbackMap.intensity || '未识别') : score + ' / 10',
    },
    {
      key: 'trigger',
      label: '诱因',
      value: pickValue(
        normalized,
        [
          { keywords: ['久坐'], value: '久坐后加重' },
          { keywords: ['走路', '行走', '久站'], value: '活动/行走后加重' },
          { keywords: ['受凉', '天气'], value: '受凉后加重' },
        ],
        fallbackMap.trigger || '未明确提及'
      ),
    },
    {
      key: 'relief',
      label: '缓解',
      value: pickValue(
        normalized,
        [
          { keywords: ['热敷'], value: '热敷后缓解' },
          { keywords: ['拉伸'], value: '拉伸后缓解' },
          { keywords: ['休息'], value: '休息后缓解' },
          { keywords: ['吃药', '止痛药', '口服'], value: '用药后部分缓解' },
        ],
        fallbackMap.relief || '未明确提及'
      ),
    },
    {
      key: 'medication',
      label: '用药',
      value: /吃药|止痛药|口服|贴膏/.test(normalized) ? '已提及用药' : '未提及用药',
    },
    {
      key: 'sleep',
      label: '睡眠',
      value: /夜间|睡|失眠|醒/.test(normalized) ? '睡眠受影响' : '未提及睡眠影响',
    },
  ];
}

module.exports = {
  parseTranscriptToFields,
};
