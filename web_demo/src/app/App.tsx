import { useMemo, useState } from 'react';

import { AIExtractPanel } from '../features/ai-extract/AIExtractPanel';
import { AskRagPanel } from '../features/ask-rag/AskRagPanel';
import { FamilyPanel } from '../features/family/FamilyPanel';
import { PainCapturePanel } from '../features/pain-capture/PainCapturePanel';
import { RiskAlertPanel } from '../features/risk-engine/RiskAlertPanel';
import { WeeklyReportPanel } from '../features/weekly-report/WeeklyReportPanel';
import { painRegions, scenarios } from '../shared/mock/demoData';
import { useDemoStore } from '../store/demoStore';

type WorkspaceTab = 'content' | 'community' | 'profile' | 'report';

const promptText = '请告诉我，您正在经历何种疼痛困扰？';
const emergencyPattern = /突发|剧痛|电击|发作|麻木|无力|走不了|睡不着|8分|9分|急性|刺痛/;

const riskTagMap = {
  low: 'L3 绿色',
  medium: 'L2 橙色',
  high: 'L1 红色',
} as const;

const communitySeed = [
  { id: 't1', room: '术后康复', title: '今天走路 20 分钟，大家都怎么分段？', meta: '18 条新消息' },
  { id: 't2', room: '腰背管理', title: '久坐后腰痛，有没有 3 分钟动作？', meta: '9 条新消息' },
  { id: 't3', room: '睡眠支持', title: '夜间疼痛影响入睡，求经验', meta: '27 条新消息' },
];

const infoCards = [
  { id: 'k1', tag: '今日推荐', title: '疼痛突然加重时，先做这 3 步', snippet: '先降负荷，再记录，再判断是否就医。' },
  { id: 'k2', tag: '康复动作', title: '久坐人群：30 秒腰背解压', snippet: '坐姿也能做，动作慢一点。' },
  { id: 'k3', tag: '家属协同', title: '如何看懂风险等级变化', snippet: '重点看连续上升，不看单次波动。' },
  { id: 'k4', tag: '用药提醒', title: '止痛药何时需要复评', snippet: '连续依赖止痛时，建议尽快复评。' },
];

const inferScenario = (text: string) => {
  if (emergencyPattern.test(text)) {
    return 'critical';
  }

  if (/加重|放射|发麻|影响走路|疼得厉害|持续/.test(text)) {
    return 'rising';
  }

  return 'stable';
};

const buildAskReply = (query: string, scenarioTitle: string) => {
  if (!query.trim()) {
    return '请输入问题。';
  }

  if (emergencyPattern.test(query)) {
    return '检测到高风险描述，建议立即线下就医评估。';
  }

  return `预设回答：结合你当前“${scenarioTitle}”状态，先降低活动强度，记录24小时变化，再决定是否复评。`;
};

const jumpToSection = (sectionId: string) => {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function App() {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const setScenario = useDemoStore((state) => state.setScenario);
  const bodySide = useDemoStore((state) => state.bodySide);
  const setBodySide = useDemoStore((state) => state.setBodySide);
  const selectedRegions = useDemoStore((state) => state.selectedRegions);
  const selectedFineRegions = useDemoStore((state) => state.selectedFineRegions);
  const activeRegionId = useDemoStore((state) => state.activeRegionId);
  const activateRegion = useDemoStore((state) => state.activateRegion);
  const toggleFineRegion = useDemoStore((state) => state.toggleFineRegion);
  const intensity = useDemoStore((state) => state.intensity);
  const setIntensity = useDemoStore((state) => state.setIntensity);
  const saveCapture = useDemoStore((state) => state.saveCapture);
  const lastSavedAt = useDemoStore((state) => state.lastSavedAt);

  const [painInput, setPainInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [profileName, setProfileName] = useState('');
  const [needAssessment, setNeedAssessment] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentError, setAssessmentError] = useState('');
  const [submittedPain, setSubmittedPain] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>('content');
  const [showDemoFlow, setShowDemoFlow] = useState(true);
  const [askInput, setAskInput] = useState('');
  const [askReply, setAskReply] = useState('');
  const [communityInput, setCommunityInput] = useState('');
  const [communityFeed, setCommunityFeed] = useState(communitySeed);

  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);

  const mapRegions = useMemo(() => painRegions.filter((region) => region.side === bodySide), [bodySide]);
  const activeRegion = useMemo(
    () => painRegions.find((region) => region.id === activeRegionId),
    [activeRegionId],
  );

  const selectedRegionNames = useMemo(
    () =>
      painRegions
        .filter((region) => selectedRegions.includes(region.id))
        .map((region) => {
          const fineCount = selectedFineRegions[region.id]?.length ?? 0;
          return fineCount > 0 ? `${region.label} · ${fineCount}个细分` : `${region.label} · 粗粒度`;
        }),
    [selectedFineRegions, selectedRegions],
  );

  const fineRegionCount = useMemo(
    () => Object.values(selectedFineRegions).reduce((sum, list) => sum + list.length, 0),
    [selectedFineRegions],
  );

  const qualityLevel =
    selectedRegions.length === 0
      ? 'none'
      : fineRegionCount === 0
        ? 'low'
        : fineRegionCount < selectedRegions.length
          ? 'medium'
          : 'high';

  const qualityLabelMap = {
    none: '未采集',
    low: '粗粒度记录',
    medium: '中等质量',
    high: '高质量记录',
  };

  const qualityScore =
    selectedRegions.length === 0 ? 0 : Math.min(100, Math.round(40 + (fineRegionCount / selectedRegions.length) * 60));

  const weeklyAvg = useMemo(() => {
    const sum = scenario.weekly.reduce((acc, item) => acc + item.pain, 0);
    return (sum / scenario.weekly.length).toFixed(1);
  }, [scenario.weekly]);

  const goReportSection = (sectionId: string) => {
    setTab('report');
    window.setTimeout(() => jumpToSection(sectionId), 120);
  };

  const handleSubmitPain = () => {
    const text = painInput.trim();
    if (!text) {
      return;
    }

    setSubmittedPain(true);
    const nextScenarioId = inferScenario(text);
    setScenario(nextScenarioId);

    const shouldAssess = emergencyPattern.test(text);
    setNeedAssessment(shouldAssess);
    if (shouldAssess) {
      setAssessmentError('');
      setShowAssessment(true);
    }
  };

  const handleFinishAssessment = () => {
    if (selectedRegions.length === 0) {
      setAssessmentError('请先点选至少一个疼痛区域。');
      return;
    }

    saveCapture();
    setAssessmentError('');
    setShowAssessment(false);
  };

  const handleCreateProfile = () => {
    const text = nameInput.trim();
    if (!text) {
      return;
    }

    setProfileName(text);
    setTab('content');
  };

  const handlePostCommunity = () => {
    const text = communityInput.trim();
    if (!text) {
      return;
    }

    const draft = {
      id: `draft-${Date.now()}`,
      room: '我的提问',
      title: text,
      meta: '刚刚发布',
    };

    setCommunityFeed((prev) => [draft, ...prev]);
    setCommunityInput('');
  };

  const onboardDone = profileName.length > 0;
  const canAskName = painInput.trim().length > 0 && (!needAssessment || !showAssessment);

  return (
    <div className="stream-shell">
      <main className="stream-main">
        {!onboardDone ? (
          <section className="intake-card">
            <h1 className="intake-title">{promptText}</h1>

            <div className="intake-input-row">
              <input
                value={painInput}
                onChange={(event) => setPainInput(event.target.value)}
                placeholder="例如：右侧腰背突然刺痛，走路更疼"
                aria-label="疼痛描述"
              />
              <button type="button" className="primary-btn" onClick={handleSubmitPain}>
                继续
              </button>
            </div>

            {submittedPain ? (
              <article className={needAssessment ? 'first-feedback first-feedback--high' : 'first-feedback'}>
                <span className="feedback-badge">{riskTagMap[scenario.riskLevel]}</span>
                <h3>{scenario.title}</h3>
                <p>{scenario.riskReason}</p>
                <div className="first-feedback__actions">
                  {needAssessment ? (
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        setAssessmentError('');
                        setShowAssessment(true);
                      }}
                    >
                      先做 2D 评估
                    </button>
                  ) : (
                    <button type="button" className="ghost-btn" onClick={() => setNeedAssessment(false)}>
                      继续建档
                    </button>
                  )}
                </div>
              </article>
            ) : null}

            {canAskName ? (
              <div className="intake-name-row">
                <p>好的，我了解了您的情况。请问怎么称呼您？</p>
                <div className="intake-input-row">
                  <input
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    placeholder="请输入称呼"
                    aria-label="用户称呼"
                  />
                  <button type="button" className="primary-btn" onClick={handleCreateProfile}>
                    创建档案
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="mini-workspace">
            <div className="mini-stage">
              {tab === 'content' ? (
                <>
                  <section className="mini-hero-card">
                    <p className="mini-kicker">内容流</p>
                    <h2 className="mini-title">{scenario.title}</h2>
                    <p className="mini-subtitle">{scenario.subtitle}</p>
                    <p className="mini-muted">当前重点：{scenario.riskReason}</p>
                    <div className="mini-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => {
                          setAssessmentError('');
                          setShowAssessment(true);
                        }}
                      >
                        开始记录
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setTab('report')}>
                        查看Demo Report
                      </button>
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>场景切换</h3>
                    <div className="mini-scenario-list">
                      {scenarios.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={item.id === scenario.id ? 'mini-scenario-btn mini-scenario-btn--active' : 'mini-scenario-btn'}
                          onClick={() => setScenario(item.id)}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>今日摘要</h3>
                    <div className="mini-bullet-row">
                      <span>风险等级</span>
                      <strong>{riskTagMap[scenario.riskLevel]}</strong>
                    </div>
                    <div className="mini-bullet-row">
                      <span>当前强度</span>
                      <strong>{intensity}/10</strong>
                    </div>
                    <div className="mini-bullet-row">
                      <span>采集质量</span>
                      <strong>{qualityScore}</strong>
                    </div>
                    <div className="mini-bullet-row">
                      <span>7日均值</span>
                      <strong>{weeklyAvg}</strong>
                    </div>
                  </section>

                  {infoCards.map((card) => (
                    <article className="mini-card mini-feed-card" key={card.id}>
                      <span className="mini-tag">{card.tag}</span>
                      <h4>{card.title}</h4>
                      <p>{card.snippet}</p>
                    </article>
                  ))}
                </>
              ) : null}

              {tab === 'community' ? (
                <>
                  <section className="mini-hero-card">
                    <p className="mini-kicker">社群</p>
                    <h2 className="mini-title">一起交流，互相支持</h2>
                    <p className="mini-subtitle">提问、经验、打卡心得</p>
                    <div className="mini-post-row">
                      <input
                        value={communityInput}
                        onChange={(event) => setCommunityInput(event.target.value)}
                        placeholder="说说你今天的情况"
                        aria-label="社群输入"
                      />
                      <button type="button" className="primary-btn" onClick={handlePostCommunity}>
                        发布
                      </button>
                    </div>
                  </section>

                  {communityFeed.map((thread) => (
                    <article key={thread.id} className="mini-card mini-thread-card">
                      <div className="mini-thread-avatar">{thread.room.slice(0, 1)}</div>
                      <div>
                        <h4>{thread.room}</h4>
                        <p>{thread.title}</p>
                        <span>{thread.meta}</span>
                      </div>
                    </article>
                  ))}
                </>
              ) : null}

              {tab === 'profile' ? (
                <>
                  <section className="mini-hero-card">
                    <p className="mini-kicker">个人档案</p>
                    <h2 className="mini-title">{profileName}，你好</h2>
                    <p className="mini-subtitle">档案持续更新中</p>
                    <div className="mini-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => {
                          setAssessmentError('');
                          setShowAssessment(true);
                        }}
                      >
                        记录疼痛
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setTab('report')}>
                        查看Demo Report
                      </button>
                    </div>
                  </section>

                  <section className="mini-profile-grid">
                    <article className="mini-card">
                      <span>当前痛感</span>
                      <strong>{scenario.intensity} / 10</strong>
                    </article>
                    <article className="mini-card">
                      <span>风险等级</span>
                      <strong>{riskTagMap[scenario.riskLevel]}</strong>
                    </article>
                    <article className="mini-card">
                      <span>最近保存</span>
                      <strong>{lastSavedAt ?? '未保存'}</strong>
                    </article>
                  </section>

                  <section className="mini-card">
                    <h3>疼痛趋势</h3>
                    <div className="trend-bars" aria-label="疼痛趋势图">
                      {scenario.weekly.map((item) => (
                        <div key={item.day} className="trend-bar-wrap">
                          <div className="trend-bar" style={{ height: `${24 + item.pain * 9}px` }} />
                          <span>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>发作模式与用药</h3>
                    <div className="mini-bullet-row">
                      <span>已选区域</span>
                      <strong>{selectedRegionNames.join('、') || '未采集'}</strong>
                    </div>
                    <div className="mini-bullet-row">
                      <span>AI建议</span>
                      <strong>{scenario.reportBullets[0]}</strong>
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>医学问答</h3>
                    <div className="qa-row">
                      <input
                        value={askInput}
                        onChange={(event) => setAskInput(event.target.value)}
                        placeholder="请输入医学问题"
                        aria-label="医学问答输入"
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => setAskReply(buildAskReply(askInput, scenario.title))}
                      >
                        提问
                      </button>
                    </div>
                    {askReply ? <p className="qa-reply">{askReply}</p> : null}
                  </section>
                </>
              ) : null}

              {tab === 'report' ? (
                <>
                  <section className="mini-hero-card report-hero">
                    <p className="mini-kicker">Demo Report</p>
                    <h2 className="mini-title">完整演示示例与亮点展示</h2>
                    <div className="mini-actions">
                      <button type="button" className="ghost-btn" onClick={() => goReportSection('risk-section')}>
                        跳到风险预警
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => goReportSection('weekly-section')}>
                        跳到周报趋势
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => setShowDemoFlow((value) => !value)}
                      >
                        {showDemoFlow ? '收起链路' : '展开链路'}
                      </button>
                    </div>
                  </section>

                  {showDemoFlow ? (
                    <section className="report-flow-shell">
                      <PainCapturePanel />
                      <AIExtractPanel />
                      <RiskAlertPanel />
                      <WeeklyReportPanel />
                      <AskRagPanel />
                      <FamilyPanel />
                    </section>
                  ) : null}
                </>
              ) : null}
            </div>

            <footer className="mini-tabbar" aria-label="小程序风格选项卡">
              <button
                type="button"
                className={tab === 'content' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('content')}
              >
                内容
              </button>
              <button
                type="button"
                className={tab === 'community' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('community')}
              >
                社群
              </button>
              <button
                type="button"
                className={tab === 'profile' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('profile')}
              >
                个人+问答
              </button>
              <button
                type="button"
                className={tab === 'report' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('report')}
              >
                Demo Report
              </button>
            </footer>
          </section>
        )}

        {showAssessment ? (
          <div className="intake-modal" role="dialog" aria-modal="true" aria-label="2D人体评估">
            <div className="intake-modal__panel">
              <h3>检测到疼痛发作，开始 2D 评估</h3>

              <div className="side-switch">
                <button
                  type="button"
                  className={bodySide === 'front' ? 'side-switch__btn side-switch__btn--active' : 'side-switch__btn'}
                  onClick={() => setBodySide('front')}
                >
                  前视
                </button>
                <button
                  type="button"
                  className={bodySide === 'back' ? 'side-switch__btn side-switch__btn--active' : 'side-switch__btn'}
                  onClick={() => setBodySide('back')}
                >
                  后视
                </button>
              </div>

              <div className="compact-map">
                {mapRegions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    className={selectedRegions.includes(region.id) ? 'compact-zone compact-zone--active' : 'compact-zone'}
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                    onClick={() => activateRegion(region.id)}
                  >
                    {region.label.length > 4 ? region.label.slice(0, 4) : region.label}
                  </button>
                ))}
              </div>

              <div className={`quality-card quality-card--${qualityLevel}`}>
                <p className="quality-card__title">数据质量：{qualityLabelMap[qualityLevel]}</p>
                <p className="muted">细分点位越完整，后续AI建议越稳定。</p>
                <div className="quality-score">
                  <span>记录可信度</span>
                  <strong>{qualityScore}</strong>
                </div>
              </div>

              {activeRegion ? (
                <div className="region-detail">
                  <div className="region-detail__header">
                    <h4>{activeRegion.label} · 细分定位</h4>
                  </div>
                  <div className="fine-chip-wrap">
                    {activeRegion.fineRegions.map((fine) => {
                      const checked = (selectedFineRegions[activeRegion.id] ?? []).includes(fine.id);
                      return (
                        <button
                          key={fine.id}
                          type="button"
                          className={checked ? 'fine-chip fine-chip--active' : 'fine-chip'}
                          onClick={() => toggleFineRegion(activeRegion.id, fine.id)}
                        >
                          {fine.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="compact-meter">
                <label htmlFor="quick-intensity">强度 {intensity}/10</label>
                <input
                  id="quick-intensity"
                  type="range"
                  min={0}
                  max={10}
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                />
              </div>

              {assessmentError ? <p className="assessment-error">{assessmentError}</p> : null}

              <div className="intake-modal__actions">
                <button type="button" className="ghost-btn" onClick={() => setShowAssessment(false)}>
                  稍后再评估
                </button>
                <button type="button" className="primary-btn" onClick={handleFinishAssessment}>
                  完成采集
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
