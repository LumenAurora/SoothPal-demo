import { useMemo, useState } from 'react';

import { redactQuery } from '../../shared/mock/demoData';
import { GlassCard } from '../../shared/ui/GlassCard';
import { SectionTitle } from '../../shared/ui/SectionTitle';

interface KBChunk {
  id: string;
  title: string;
  text: string;
  tags: string[];
  source: string;
}

interface AskResult {
  isHighRisk: boolean;
  redactedQuery: string;
  answer: string;
  chunks: KBChunk[];
}

const kbChunks: KBChunk[] = [
  {
    id: 'chunk_01',
    title: '慢性腰痛基础管理',
    text: '慢性腰痛以分级活动、热敷和短时拉伸为基础。避免久坐超过40分钟，保持低强度规律活动。',
    tags: ['腰痛', '热敷', '拉伸', '活动'],
    source: '2024 慢性疼痛管理指南',
  },
  {
    id: 'chunk_02',
    title: '术后早期康复注意事项',
    text: '术后第一周应控制活动量，避免负重和扭转动作。出现疼痛波动时优先休息并联系康复师复评。',
    tags: ['术后', '康复', '负重', '复评'],
    source: '术后居家康复建议（临床共识）',
  },
  {
    id: 'chunk_03',
    title: '红旗征象速查',
    text: '如果出现突发剧痛、进行性下肢无力、大小便功能异常或伴发热，应尽快线下就医，不建议继续居家观察。',
    tags: ['红旗征象', '突发剧痛', '无力', '大小便异常', '发热'],
    source: '脊柱相关红旗征象速查表',
  },
  {
    id: 'chunk_04',
    title: '睡眠受影响时的处理',
    text: '夜间疼痛影响睡眠时，可在睡前进行10分钟呼吸放松和温和拉伸，并记录入睡前疼痛评分。',
    tags: ['睡眠', '夜间', '放松', '拉伸'],
    source: '慢性疼痛与睡眠管理手册',
  },
  {
    id: 'chunk_05',
    title: '用药安全边界',
    text: '平台仅提供一般科普，不提供个体化处方剂量调整建议。涉及药物加减量应由医生评估后决定。',
    tags: ['用药', '安全边界', '剂量'],
    source: '家庭用药安全规范',
  },
  {
    id: 'chunk_06',
    title: '步行与功能恢复',
    text: '每日分段步行有助于功能恢复。建议从可耐受强度开始，每日递增5%-10%，避免一次性过量。',
    tags: ['步行', '功能恢复', '运动'],
    source: '居家运动干预建议',
  },
  {
    id: 'chunk_07',
    title: '家属协同照护要点',
    text: '家属端重点关注趋势变化和失访提醒，不需查看详细隐私内容。出现连续升高应优先协助就医。',
    tags: ['家属', '趋势', '失访', '预警'],
    source: '居家照护协同指南',
  },
  {
    id: 'chunk_08',
    title: '久坐办公干预建议',
    text: '办公人群建议每30-40分钟进行站立和步行，配合腰背伸展动作，减少久坐相关疼痛波动。',
    tags: ['久坐', '办公', '站立', '伸展'],
    source: '职业性腰背痛防护建议',
  },
];

const highRiskPattern = /麻木无力|大小便异常|突发剧痛|发热|进行性无力|失禁/;

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

const scoreChunk = (chunk: KBChunk, tokens: string[]) => {
  const title = chunk.title.toLowerCase();
  const content = chunk.text.toLowerCase();
  const tags = chunk.tags.map((tag) => tag.toLowerCase());

  return tokens.reduce((score, token) => {
    let nextScore = score;
    if (title.includes(token)) {
      nextScore += 3;
    }
    if (content.includes(token)) {
      nextScore += 2;
    }
    if (tags.some((tag) => tag.includes(token))) {
      nextScore += 2;
    }
    return nextScore;
  }, 0);
};

const retrieveChunks = (query: string, topK = 3) => {
  const tokens = tokenize(query);
  return kbChunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, tokens) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
    .map((item) => item.chunk);
};

const buildCareAnswer = (query: string, chunks: KBChunk[]) => {
  const hasSleep = /睡|夜间/.test(query);
  const hasMedication = /药|止痛/.test(query);

  const steps = [
    '先做低强度处理：今天避免久坐和负重，按可耐受节奏活动。',
    '执行 10-15 分钟热敷或温和拉伸，观察 2-4 小时变化。',
    '继续记录疼痛分值与活动量，若连续升高请尽快复评。',
  ];

  if (hasSleep) {
    steps[1] = '睡前做 10 分钟呼吸放松 + 温和拉伸，帮助降低夜间不适。';
  }
  if (hasMedication) {
    steps.push('涉及药物剂量调整时请联系医生，平台不提供处方剂量建议。');
  }

  const evidence = chunks[0]?.text ?? '根据当前知识库，可先进行低风险家庭缓解并持续观察趋势。';

  return `${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n依据摘要：${evidence}`;
};

const runRag = (query: string): AskResult => {
  const redactedQuery = redactQuery(query);
  const highRiskHit = highRiskPattern.test(redactedQuery);

  if (highRiskHit) {
    const urgentChunk = kbChunks.find((chunk) => chunk.id === 'chunk_03');
    return {
      isHighRisk: true,
      redactedQuery,
      answer:
        '检测到红旗征象关键词。建议立即线下就医评估，不建议继续在家观察。若存在进行性无力或大小便异常，请优先急诊。',
      chunks: urgentChunk ? [urgentChunk] : [],
    };
  }

  const chunks = retrieveChunks(redactedQuery, 3);
  return {
    isHighRisk: false,
    redactedQuery,
    answer: buildCareAnswer(redactedQuery, chunks),
    chunks,
  };
};

const defaultQuestion = '最近腰背痛反复，晚上睡不好，还能继续散步吗？';

export function AskRagPanel() {
  const [query, setQuery] = useState(defaultQuestion);
  const [submittedQuery, setSubmittedQuery] = useState(defaultQuestion);

  const result = useMemo(() => runRag(submittedQuery), [submittedQuery]);
  const citationText = result.chunks.map((chunk) => `${chunk.source}（${chunk.id}）`).join('；');

  return (
    <div className="feature-grid" id="ask-section">
      <GlassCard>
        <SectionTitle
          kicker="Scene E / RAG + Guardrail"
          title="个体化问答（带引用）"
          description="先脱敏再检索，命中红旗词时优先就医建议。此流程可平滑替换为 ima 检索接口。"
        />

        <div className="ask-layout">
          <section className="ask-query">
            <p className="extract-result__title">输入问题（支持现场改问）</p>
            <textarea
              className="ask-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="RAG问题输入"
            />

            <div className="ask-actions">
              <button type="button" className="primary-btn" onClick={() => setSubmittedQuery(query.trim() || defaultQuestion)}>
                提交问答
              </button>
              <button type="button" className="ghost-btn" onClick={() => setQuery(defaultQuestion)}>
                载入演示提问
              </button>
            </div>

            <div className="redaction-flow">
              <p className="extract-result__title">脱敏检索流程（可替换 ima 接口）</p>
              <div className="redaction-box">
                <span>脱敏前 Query</span>
                <strong>{submittedQuery}</strong>
              </div>
              <div className="redaction-box redaction-box--safe">
                <span>脱敏后 Query</span>
                <strong>{result.redactedQuery}</strong>
              </div>
            </div>

            <p className="ask-note">演示说明：当前是本地 KB 检索，线上可替换为 ima/RAG 服务结果。</p>
          </section>

          <section className={result.isHighRisk ? 'ask-answer ask-answer--high-risk' : 'ask-answer'}>
            <p className="extract-result__title">AI 回答（适老短句 + 可解释）</p>
            <pre className="ask-answer__text">{result.answer}</pre>

            {citationText ? <p className="citation-tag">参考来源：{citationText}</p> : null}

            <div className="ask-citations">
              {result.chunks.map((chunk) => (
                <article key={chunk.id} className="ask-citation-card">
                  <p>{chunk.title}</p>
                  <span>{chunk.id}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </GlassCard>
    </div>
  );
}
