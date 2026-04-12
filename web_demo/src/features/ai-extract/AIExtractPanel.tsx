import { useMemo } from 'react';
import { motion } from 'framer-motion';

import { redactQuery, scenarios } from '../../shared/mock/demoData';
import { GlassCard } from '../../shared/ui/GlassCard';
import { SectionTitle } from '../../shared/ui/SectionTitle';
import { useDemoStore } from '../../store/demoStore';

export function AIExtractPanel() {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const redacted = useMemo(() => redactQuery(scenario.redactionQuery), [scenario.redactionQuery]);

  return (
    <div className="feature-grid" id="extract-section">
      <GlassCard>
        <SectionTitle
          kicker="Scene B / Structured AI"
          title="语音一句话 -> AI 自动结构化"
          description="Agent 先结构化，再给可解释建议与引用。检索前默认走脱敏，避免敏感信息外发。"
        />

        <div className="extract-layout">
          <div className="chat-thread">
            <motion.div
              className="chat-bubble chat-bubble--user"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="chat-bubble__label">用户语音转写</p>
              <p>{scenario.transcript}</p>
            </motion.div>

            <motion.div
              className="chat-bubble chat-bubble--ai"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="chat-bubble__label">AI Agent 建议</p>
              <p>{scenario.agentReply}</p>
              <p className="citation-tag">引用：{scenario.citation}</p>
              <button type="button" className="ghost-btn">
                播放 2 分钟缓解视频
              </button>
            </motion.div>
          </div>

          <div className="extract-result">
            <p className="extract-result__title">PainEntry JSON（可编辑确认）</p>
            <div className="extract-result__list">
              {scenario.extraction.map((field, index) => (
                <motion.div
                  className="extract-row"
                  key={field.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </motion.div>
              ))}
            </div>

            <div className="redaction-flow">
              <p className="extract-result__title">脱敏检索流程（可替换 ima 接口）</p>
              <div className="redaction-box">
                <span>脱敏前 Query</span>
                <strong>{scenario.redactionQuery}</strong>
              </div>
              <div className="redaction-box redaction-box--safe">
                <span>脱敏后 Query</span>
                <strong>{redacted}</strong>
              </div>
            </div>

            <div className="extract-result__actions">
              <button type="button" className="ghost-btn">
                改一处
              </button>
              <button type="button" className="primary-btn">
                确认入库
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
