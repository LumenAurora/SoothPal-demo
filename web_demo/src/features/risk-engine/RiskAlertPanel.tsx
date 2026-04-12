import { motion } from 'framer-motion';

import { scenarios } from '../../shared/mock/demoData';
import { GlassCard } from '../../shared/ui/GlassCard';
import { SectionTitle } from '../../shared/ui/SectionTitle';
import { useDemoStore } from '../../store/demoStore';

const levelMeta = {
  low: { label: 'Level 3 · 绿色', toneClass: 'risk-card--low' },
  medium: { label: 'Level 2 · 橙色', toneClass: 'risk-card--medium' },
  high: { label: 'Level 1 · 红色', toneClass: 'risk-card--high' },
};

export function RiskAlertPanel() {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const meta = levelMeta[scenario.riskLevel];

  return (
    <div className="feature-grid" id="risk-section">
      <GlassCard>
        <SectionTitle
          kicker="Scene C / Rule Engine"
          title="分级风险预警（可解释可审计）"
          description="结论由规则引擎输出，AI 负责解释和关怀话术，不替代医学决策。"
        />

        <motion.article
          className={`risk-card ${meta.toneClass}`}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <header>
            <p className="risk-card__tag">{meta.label}</p>
            <h3>{scenario.subtitle}</h3>
          </header>

          <div className="risk-card__content">
            <p>
              <span>触发规则：</span>
              <strong>{scenario.riskRuleId}</strong>
            </p>
            <p>
              <span>触发原因：</span>
              <strong>{scenario.riskReason}</strong>
            </p>
            <p>
              <span>系统动作：</span>
              <strong>患者弹窗 + 亲情号摘要 + 医嘱级提示模板</strong>
            </p>
          </div>

          <div className="risk-card__actions">
            <button type="button" className="ghost-btn">
              查看追溯链路
            </button>
            <button type="button" className="primary-btn">
              立即生成干预建议
            </button>
          </div>
        </motion.article>
      </GlassCard>
    </div>
  );
}
