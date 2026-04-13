const kbChunks = [
  {
    id: 'chunk_01',
    title: '慢性腰痛基础管理',
    text: '慢性腰痛建议分级活动，避免久坐超过40分钟。可做温和拉伸并配合热敷。',
    source: '2024 慢性疼痛管理指南',
    tags: ['腰痛', '活动', '热敷', '拉伸'],
  },
  {
    id: 'chunk_02',
    title: '术后早期康复',
    text: '术后第一周以低强度活动为主，避免负重和突然扭转，必要时及时复评。',
    source: '术后康复临床共识',
    tags: ['术后', '负重', '复评'],
  },
  {
    id: 'chunk_03',
    title: '红旗征象',
    text: '出现突发剧痛、进行性无力、大小便异常或发热，应立即线下就医，不建议继续居家观察。',
    source: '红旗征象速查表',
    tags: ['突发剧痛', '无力', '大小便异常', '发热'],
  },
  {
    id: 'chunk_04',
    title: '睡眠受影响处理',
    text: '夜间疼痛影响睡眠时，建议在睡前做呼吸放松与低幅度拉伸。',
    source: '疼痛与睡眠管理手册',
    tags: ['睡眠', '夜间', '放松'],
  },
  {
    id: 'chunk_05',
    title: '用药安全边界',
    text: '本系统不提供药物剂量增减建议，涉及处方调整请咨询医生。',
    source: '家庭用药安全规范',
    tags: ['用药', '剂量', '安全'],
  },
  {
    id: 'chunk_06',
    title: '步行康复建议',
    text: '步行训练建议分段进行，每天递增5%-10%，避免单次过量。',
    source: '居家运动干预建议',
    tags: ['步行', '康复', '运动'],
  },
  {
    id: 'chunk_07',
    title: '家属协同原则',
    text: '家属端应关注趋势和风险级别，不显示详细隐私字段。',
    source: '居家照护协同指南',
    tags: ['家属', '趋势', '隐私'],
  },
  {
    id: 'chunk_08',
    title: '久坐办公建议',
    text: '建议每30-40分钟站立活动，配合腰背伸展动作。',
    source: '职业性腰背痛防护建议',
    tags: ['久坐', '办公', '伸展'],
  },
  {
    id: 'chunk_09',
    title: '急性加重处理流程',
    text: '短时间明显加重时应降低活动强度并记录变化，若超过24小时无缓解应就医。',
    source: '家庭急性疼痛应对流程',
    tags: ['加重', '观察', '就医'],
  },
  {
    id: 'chunk_10',
    title: '周报观察指标',
    text: '建议同时观察疼痛分值、步数和睡眠质量，形成连续趋势。',
    source: '居家管理指标建议',
    tags: ['周报', '疼痛', '步数', '睡眠'],
  },
];

const highRiskPattern = /麻木无力|大小便异常|突发剧痛|发热|进行性无力|失禁/;

function redactQuery(input) {
  return (input || '')
    .replace(/1\d{10}/g, '[REDACTED_PHONE]')
    .replace(/王阿姨|李先生|张女士|赵先生|陈女士|刘先生/g, '[REDACTED_NAME]')
    .replace(/北京某医院|协和附近|某医院|某小区|某街道/g, '[REDACTED_LOCATION]');
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreChunk(chunk, tokens) {
  const title = chunk.title.toLowerCase();
  const content = chunk.text.toLowerCase();
  const tags = chunk.tags.map((item) => item.toLowerCase());

  return tokens.reduce((score, token) => {
    let current = score;
    if (title.indexOf(token) > -1) {
      current += 3;
    }
    if (content.indexOf(token) > -1) {
      current += 2;
    }
    if (tags.some((tag) => tag.indexOf(token) > -1)) {
      current += 2;
    }
    return current;
  }, 0);
}

function retrieveTopK(query, topK) {
  const tokens = tokenize(query);
  const scored = kbChunks.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, tokens),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.chunk);
}

function buildAnswer(query, chunks) {
  const hasSleep = /睡|夜间/.test(query);
  const hasMedication = /药|止痛/.test(query);

  const suggestions = [
    '先降低当天活动强度，避免久坐和负重。',
    hasSleep ? '睡前做10分钟放松呼吸和温和拉伸。' : '做10-15分钟热敷并配合温和拉伸。',
    '继续记录疼痛分值与步数，观察24小时变化。',
  ];

  if (hasMedication) {
    suggestions.push('如涉及药物剂量调整，请咨询医生。');
  }

  const evidence = chunks.length ? chunks[0].text : '请先进行低强度自我管理并持续观察趋势。';
  return suggestions.map((item, index) => `${index + 1}. ${item}`).join('\n') + `\n\n依据摘要：${evidence}`;
}

function askWithRag(queryInput) {
  const rawQuery = queryInput || '';
  const redactedQuery = redactQuery(rawQuery);

  if (highRiskPattern.test(redactedQuery)) {
    const urgentChunk = kbChunks.find((chunk) => chunk.id === 'chunk_03');
    return {
      rawQuery,
      redactedQuery,
      isHighRisk: true,
      answer: '检测到红旗征象，建议立即线下就医评估。如出现进行性无力或大小便异常，请优先急诊处理。',
      chunks: urgentChunk ? [urgentChunk] : [],
      citations: urgentChunk ? [urgentChunk.source + '（' + urgentChunk.id + '）'] : [],
    };
  }

  const chunks = retrieveTopK(redactedQuery, 3);
  return {
    rawQuery,
    redactedQuery,
    isHighRisk: false,
    answer: buildAnswer(redactedQuery, chunks),
    chunks,
    citations: chunks.map((chunk) => chunk.source + '（' + chunk.id + '）'),
  };
}

module.exports = {
  askWithRag,
  redactQuery,
  kbChunks,
};
