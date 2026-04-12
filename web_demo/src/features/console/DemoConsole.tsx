import { scenarios } from '../../shared/mock/demoData';
import { useDemoStore } from '../../store/demoStore';

interface DemoConsoleProps {
  onAutoPlay: () => void;
  onJumpTo: (sectionId: string) => void;
}

export function DemoConsole({ onAutoPlay, onJumpTo }: DemoConsoleProps) {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const setScenario = useDemoStore((state) => state.setScenario);

  return (
    <aside className="demo-console">
      <p className="demo-console__title">演示控制台</p>

      <div className="demo-console__group">
        <span>风险场景</span>
        <div className="demo-console__chips">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={scenario.id === scenarioId ? 'chip chip--active' : 'chip'}
              onClick={() => setScenario(scenario.id)}
            >
              {scenario.title}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-console__group">
        <span>跳转场景</span>
        <div className="demo-console__quick-links">
          <button type="button" onClick={() => onJumpTo('capture-section')}>
            A 采集
          </button>
          <button type="button" onClick={() => onJumpTo('extract-section')}>
            B 抽取
          </button>
          <button type="button" onClick={() => onJumpTo('risk-section')}>
            C 预警
          </button>
          <button type="button" onClick={() => onJumpTo('weekly-section')}>
            D 周报
          </button>
          <button type="button" onClick={() => onJumpTo('family-section')}>
            亲情号
          </button>
        </div>
      </div>

      <button type="button" className="primary-btn demo-console__play" onClick={onAutoPlay}>
        一键 3 分钟演示
      </button>
    </aside>
  );
}
