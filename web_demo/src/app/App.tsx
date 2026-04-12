import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

import { AIExtractPanel } from '../features/ai-extract/AIExtractPanel';
import { AskRagPanel } from '../features/ask-rag/AskRagPanel';
import { DemoConsole } from '../features/console/DemoConsole';
import { FamilyPanel } from '../features/family/FamilyPanel';
import { PainCapturePanel } from '../features/pain-capture/PainCapturePanel';
import { RiskAlertPanel } from '../features/risk-engine/RiskAlertPanel';
import { WeeklyReportPanel } from '../features/weekly-report/WeeklyReportPanel';
import { scenarios } from '../shared/mock/demoData';
import { useDemoStore } from '../store/demoStore';

interface HeroProps {
  onLoadStable: () => void;
  onLoadCritical: () => void;
  onGoCapture: () => void;
}

function Hero({ onLoadStable, onLoadCritical, onGoCapture }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero__content">
        <p className="hero__kicker">SoothPal Demo / Judge Edition</p>
        <h1>慢性疼痛 AI 管理：从 10 秒采集到可解释预警</h1>
        <p className="hero__subtitle">
          这不是聊天型健康页面，而是面向真实落地的数字疼痛管理底座。
          低负担采集、规则先决策、AI 深度融合三条能力在一次演示中全部可见。
        </p>

        <div className="hero__stats">
          <article>
            <strong>10s</strong>
            <span>完成打卡</span>
          </article>
          <article>
            <strong>Rule ID</strong>
            <span>预警可追溯</span>
          </article>
          <article>
            <strong>JSON</strong>
            <span>结构化随访</span>
          </article>
        </div>

        <div className="hero__actions">
          <button type="button" className="ghost-btn" onClick={onLoadStable}>
            加载示例数据（稳定）
          </button>
          <button type="button" className="primary-btn" onClick={onLoadCritical}>
            加载高危场景（突增）
          </button>
          <button type="button" className="ghost-btn" onClick={onGoCapture}>
            开始记录
          </button>
        </div>
      </div>
    </section>
  );
}

const stepPlan = [
  { scenarioId: 'stable', sectionId: 'capture-section' },
  { scenarioId: 'rising', sectionId: 'extract-section' },
  { scenarioId: 'critical', sectionId: 'risk-section' },
  { scenarioId: 'critical', sectionId: 'weekly-section' },
  { scenarioId: 'critical', sectionId: 'ask-section' },
  { scenarioId: 'critical', sectionId: 'family-section' },
];

export default function App() {
  const setScenario = useDemoStore((state) => state.setScenario);
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const [playing, setPlaying] = useState(false);

  const activeScenario = useMemo(
    () => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0],
    [scenarioId],
  );

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to('.orb--one', { x: 30, y: -18, duration: 9, ease: 'sine.inOut' })
      .to('.orb--two', { x: -22, y: 12, duration: 11, ease: 'sine.inOut' }, 0)
      .to('.orb--three', { x: 16, y: 20, duration: 13, ease: 'sine.inOut' }, 0);

    return () => {
      tl.kill();
    };
  }, []);

  const jumpTo = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const runAutoPlay = useCallback(() => {
    if (playing) {
      return;
    }

    setPlaying(true);
    jumpTo('top');

    stepPlan.forEach((step, index) => {
      window.setTimeout(() => {
        setScenario(step.scenarioId);
        jumpTo(step.sectionId);
      }, 900 + index * 2800);
    });

    window.setTimeout(() => {
      setPlaying(false);
      jumpTo('top');
    }, 900 + stepPlan.length * 2800 + 1200);
  }, [jumpTo, playing, setScenario]);

  const loadStableScene = useCallback(() => {
    setScenario('stable');
    jumpTo('capture-section');
  }, [jumpTo, setScenario]);

  const loadCriticalScene = useCallback(() => {
    setScenario('critical');
    jumpTo('risk-section');
  }, [jumpTo, setScenario]);

  return (
    <div className="page-shell">
      <div className="orb orb--one" />
      <div className="orb orb--two" />
      <div className="orb orb--three" />

      <main className="page-content">
        <Hero onLoadStable={loadStableScene} onLoadCritical={loadCriticalScene} onGoCapture={() => jumpTo('capture-section')} />

        <motion.div
          className="scenario-banner"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeScenario.id}
        >
          <p>当前演示场景：{activeScenario.title}</p>
          <span>{activeScenario.subtitle}</span>
        </motion.div>

        <PainCapturePanel />
        <AIExtractPanel key={activeScenario.id} />
        <RiskAlertPanel />
        <WeeklyReportPanel />
        <AskRagPanel />
        <FamilyPanel />
      </main>

      <DemoConsole onAutoPlay={runAutoPlay} onJumpTo={jumpTo} />
    </div>
  );
}
