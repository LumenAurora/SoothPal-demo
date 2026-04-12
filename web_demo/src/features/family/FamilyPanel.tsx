import { motion } from 'framer-motion';

import { scenarios } from '../../shared/mock/demoData';
import { GlassCard } from '../../shared/ui/GlassCard';
import { SectionTitle } from '../../shared/ui/SectionTitle';
import { useDemoStore } from '../../store/demoStore';

export function FamilyPanel() {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];

  return (
    <div className="feature-grid" id="family-section">
      <GlassCard>
        <SectionTitle
          kicker="Family Link"
          title="亲情号摘要通知"
          description="只共享趋势与风险等级，避免暴露不必要隐私，兼顾安全与陪伴。"
        />

        <motion.div className="family-message" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}>
          <p className="family-message__label">家属端收到</p>
          <p>{scenario.familyMessage}</p>
        </motion.div>
      </GlassCard>
    </div>
  );
}
